import { and, eq, exists, gt } from "drizzle-orm"
import db from "../../db/connectDb"
import { user } from "../../db/schema/user.model"
import { BadRequestException } from "../../utils/error"
import { ErrorCode } from "../../@types/errorCode.enum"
import { sendChamp_send_sms } from "../../helpers/sendSms"
import { tokenModel, tokenSchemaInsert } from "../../db/schema/token.model"
import { generateRef } from "../../utils/generateRef"
import termiiServices from "../../providers/termii/termii-services"
import { SENDER_ID } from "../../providers/termii/termii-base"
import config from "../../config/app.config"
import { systemLogger } from "../../utils/logger"
import { VerificationEnum } from "../../@types/types"
import cache from "../../config/node-cache"
import { session } from "../../db/schema/session.model"
import { AccessTokenSignOptions, AudienceType, jwtUtility, RefreshTokenSignOptions, TokenPayload } from "../../utils/jwt"
import { PasswordUtils } from "../../utils/password.utils"


type RegisterUserData = {
    phoneNumber: string,
}

type UserProfileData = {
    email: string
    password: string
    firstName: string
    lastName: string
}

type NewUser = typeof user.$inferInsert;



export default class AuthServices {

    /**
    * Retrieves a valid token record for the given token and type.
    * @param token - The token to validate.
    * @param type - The token type (e.g., 'email_verification').
    * @returns The valid token record or null if not found.
    */
    private async getValidToken(token: string, type: string) {
        const [record] = await db
            .select()
            .from(tokenModel)
            .where(
                and(
                    eq(tokenModel.token, token),
                    eq(tokenModel.type, type),
                    gt(tokenModel.expires_at, new Date())
                )
            );
        return record || null;
    }

    public async registerUser(userdata: RegisterUserData): Promise<void> {

        const { phoneNumber } = userdata


        return await db.transaction(async (tx) => {

            const userExistsQuery = db.select().from(user).where(eq(user.phone_number, phoneNumber));
            const userExists = await tx.select().from(user).where(exists(userExistsQuery)).execute();

            if (userExists.length > 0) {
                throw new BadRequestException("User already exists", ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
            }

            const token = generateRef(undefined, 6, true);
            const message = `Your GABS Wealth OTP is ${token} . Expires in 5 minutes. `;

            cache.set(phoneNumber, token, 5 * 60)


            await termiiServices.sendSms({
                channel: 'generic',
                from: SENDER_ID,
                to: phoneNumber,
                api_key: config.TERMII_API_KEY,
                type: 'plain',
                sms: message
            })


            console.log(token, "this is the token generated and sent to the frontend")
            systemLogger.info(`OTP sent to ${phoneNumber} : token is ${token}`);



        })




    }


    public async verifyPhoneNumber(phoneNumber: string, otp: string): Promise<{ id: string, accessToken: string, refreshToken: string }> {


        if (!otp) {
            throw new BadRequestException(
                "Verification code is required",
                ErrorCode.BAD_REQUEST
            );
        }

        const value = cache.take(phoneNumber)

        if (!value || value !== otp) {

            systemLogger.error(`Failed OTP verification for ${phoneNumber}: Invalid or expired OTP.`);
            throw new BadRequestException("Invalid or Expired OTP", ErrorCode.AUTH_INVALID_TOKEN)
        }


        try {

            return await db.transaction(async (tx) => {


                const [newUser] = await tx.insert(user).values({ phone_number: phoneNumber, is_phone_verified: true }).returning({
                    id: user.id,
                });


                const [sessionId] = await tx.insert(session).values({ user_id: newUser.id, expires_at: new Date(Date.now() + 30 * 24 * 60 * 60) }).returning({
                    id: session.id
                })


                const tokenPayload: TokenPayload = {
                    user_id: newUser.id,
                    aud: AudienceType.Web,
                    session_id: sessionId.id,
                };

                const accessToken = jwtUtility.signToken('access', tokenPayload, AccessTokenSignOptions);
                const refreshToken = jwtUtility.signToken('refresh', tokenPayload, RefreshTokenSignOptions);


                await tx.update(user).set({ refresh_token: [refreshToken] }).where(eq(user.id, newUser.id))

                console.log(`User ${newUser.id} verified their phone successfully.`);
                systemLogger.info(`User ${newUser.id} verified their phone successfully.`);

                return {
                    id: newUser.id,
                    accessToken,
                    refreshToken
                }

            });

        } catch (error) {
            systemLogger.error(`Error during phone verification for ${phoneNumber}: ${error}`);
            throw new BadRequestException("Failed to verify phone number", ErrorCode.VERIFICATION_ERROR);
        }


    }

 

    public async verifyPasscode(passcode: string, userId: string): Promise<{ number_of_attemps: number; has_exceeded_attemp: boolean } | void> {
        const MAX_ATTEMPTS = 3;
        const RETRY_KEY = `passcode_attempts_${userId}`;

        if (!passcode) {
            throw new BadRequestException("Passcode is required", ErrorCode.BAD_REQUEST);
        }

        const [existingUser] = await db.select().from(user).where(eq(user.id, userId));

        if (!existingUser) {
            throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
        }

        if (!existingUser.passcode) {
            throw new BadRequestException("Passcode not set for this user", ErrorCode.AUTH_INVALID_TOKEN);
        }

        const attempts = cache.get<number>(RETRY_KEY) || 0;

        const hasExceeded = attempts >= MAX_ATTEMPTS

        if (hasExceeded) {
            await db.transaction(async (tx) => {
                await tx.update(user).set({ is_flagged: true }).where(eq(user.id, userId));
            });
            systemLogger.error(`User ${userId} account flagged due to too many failed passcode attempts.`);

            return {
                number_of_attemps: attempts,
                has_exceeded_attemp: hasExceeded
            }

        }

        const isPasscodeValid = await PasswordUtils.comparePassword(passcode, existingUser.passcode);

        if (!isPasscodeValid) {
            cache.set(RETRY_KEY, attempts + 1, 60 * 60);
            systemLogger.error(`Passcode verification failed for user ${userId}. Attempt ${attempts + 1} of ${MAX_ATTEMPTS}.`);
            throw new BadRequestException("Invalid passcode", ErrorCode.AUTH_INVALID_TOKEN);
        }

        cache.del(RETRY_KEY);

        systemLogger.info(`Passcode successfully verified for user ${userId}`);
    }


    public async login(phoneNumber: string, password: string): Promise<void> {



    }


}