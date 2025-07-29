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
import { setup } from "../../db/schema/setup.model"
import { NodePgDatabase, NodePgTransaction } from "drizzle-orm/node-postgres"
import { sendOtp } from "../../helpers/sendOtp"


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

    private RETRY_KEY = `passcode_attempts_`;


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


    private async setAuthCredentials(tx: NodePgTransaction<any, any>, payload: { userId: string }): Promise<{ accessToken: string, refreshToken: string }> {


        const refreshTokenExpiresInSeconds = typeof RefreshTokenSignOptions.expiresIn === "number"
            ? RefreshTokenSignOptions.expiresIn
            : 4 * 60 * 60;

        const [sessionId] = await tx.insert(session).values({
            user_id: payload.userId,
            expires_at: new Date(Date.now() + refreshTokenExpiresInSeconds * 1000)
        }).returning({ id: session.id });


        const tokenPayload: TokenPayload = {
            user_id: payload.userId,
            aud: AudienceType.MobileApp,
            session_id: sessionId.id,
        };

        const accessToken = jwtUtility.signToken('access', tokenPayload, AccessTokenSignOptions);
        const refreshToken = jwtUtility.signToken('refresh', tokenPayload, RefreshTokenSignOptions);

        return {
            accessToken,
            refreshToken
        }

    }

    public async registerUser(userdata: RegisterUserData): Promise<void> {

        const { phoneNumber } = userdata


        return await db.transaction(async (tx) => {

            const userExistsQuery = db.select().from(user).where(eq(user.phone_number, phoneNumber));
            const userExists = await tx.select().from(user).where(exists(userExistsQuery)).execute();

            if (userExists.length > 0) {
                throw new BadRequestException("User already exists", ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
            }

            await sendOtp(phoneNumber)



        })




    }


    public async verifyPhoneNumber(phoneNumber: string, otp: string): Promise<{ accessToken: string, refreshToken: string }> {


        if (!otp) {
            throw new BadRequestException(
                "Verification code is required",
                ErrorCode.BAD_REQUEST
            );
        }

        const value = cache.get(phoneNumber)

        if (!value || value !== otp) {

            systemLogger.error(`Failed OTP verification for ${phoneNumber}: Invalid or expired OTP.`);
            throw new BadRequestException("Invalid or Expired OTP", ErrorCode.AUTH_INVALID_TOKEN)
        }

        cache.del(phoneNumber)


        try {

            return await db.transaction(async (tx) => {


                const [newUser] = await tx.insert(user).values({ phone_number: phoneNumber }).returning({
                    id: user.id,
                });

                const { accessToken, refreshToken } = await this.setAuthCredentials(tx, { userId: newUser.id })

                await tx.update(user).set({ refresh_token: [refreshToken] }).where(eq(user.id, newUser.id))
                await tx.insert(setup).values({ is_phone_verified: true, user_id: newUser.id });


                console.log(`User ${newUser.id} verified their phone successfully.`);
                systemLogger.info(`User ${newUser.id} verified their phone successfully.`);

                return {
                    accessToken,
                    refreshToken
                }

            });

        } catch (error) {
            systemLogger.error(`Error during phone verification for ${phoneNumber}: ${error}`);
            throw new BadRequestException("Failed to verify phone number", ErrorCode.VERIFICATION_ERROR);
        }


    }



    public async verifyPasscode(passcode: string, userId: string): Promise<{ number_of_attempts: number; has_exceeded_attempts: boolean } | void> {
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
                number_of_attempts: attempts,
                has_exceeded_attempts: hasExceeded
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


    public async resendToken(phoneNumber: string) {

        await sendOtp(phoneNumber)

    }


    public async login(phoneNumber: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {


        try {
            return await db.transaction(async (tx) => {


                const subquery = db.select().from(user).where(eq(user.phone_number, phoneNumber));
                const userExistsResult = await db
                    .select({ exists: exists(subquery) })
                    .from(user);

                if (!userExistsResult[0]?.exists) {
                    throw new BadRequestException("User does not exist", ErrorCode.AUTH_USER_NOT_FOUND);
                }

                const [existingUser] = await db.select().from(user).where(eq(user.phone_number, phoneNumber));
                if (!existingUser) {
                    throw new BadRequestException("User data could not be fetched.", ErrorCode.AUTH_USER_NOT_FOUND);
                }

                const isPasswordValid = await PasswordUtils.comparePassword(password, existingUser.password as string);

                console.log(isPasswordValid, "this is the password valid check")

                if (!isPasswordValid) {
                    throw new BadRequestException("Incorrect login credentials", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);
                }

                const incomingRefreshTokens = existingUser.refresh_token || [];


                const reusedTokenDetected = incomingRefreshTokens.some(token => {
                    try {

                        const decoded = jwtUtility.decodeToken(token)

                        const verifiedToken = jwtUtility.verifyRefreshToken(token, { audience: AudienceType.MobileApp, subject: existingUser.id, issuer: decoded?.iss as string });
                        return verifiedToken?.user_id !== existingUser.id; // foreign token
                    } catch {
                        return false;
                    }
                });

                if (reusedTokenDetected) {
                    systemLogger.warn(`Refresh token reuse suspected for user: ${existingUser.id}`);
                    await tx.update(user).set({ refresh_token: [] }).where(eq(user.id, existingUser.id));
                }

                const { accessToken, refreshToken: newRefreshToken } = await this.setAuthCredentials(tx, { userId: existingUser.id })


                const validRefreshTokens = incomingRefreshTokens.filter(token => {
                    try {
                        const decoded = jwtUtility.decodeToken(token)

                        jwtUtility.verifyRefreshToken(token, { audience: AudienceType.MobileApp, subject: existingUser.id, issuer: decoded?.iss as string }); return true;
                    } catch {
                        return false;
                    }
                });

                const updatedRefreshTokens = [...validRefreshTokens.slice(-4), newRefreshToken]; // keep latest 4
                await tx.update(user).set({ refresh_token: updatedRefreshTokens }).where(eq(user.id, existingUser.id));

                return {
                    accessToken,
                    refreshToken: newRefreshToken,
                };

            })

        } catch (error) {
            systemLogger.error(error)
            throw new BadRequestException("Error logging in", ErrorCode.BAD_REQUEST);

        }



    }


    public async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {

        console.log("this is the first refresh token we are processing")


        if (!refreshToken) {
            throw new BadRequestException("Refresh token is required", ErrorCode.BAD_REQUEST);
        }



        try {
            const decoded = jwtUtility.decodeToken(refreshToken);

            const decodedToken = jwtUtility.verifyRefreshToken(refreshToken, {
                audience: AudienceType.MobileApp,
                subject: decoded?.sub as string,
                issuer: decoded?.iss as string
            }) as TokenPayload;

            if (!decodedToken || !decodedToken.user_id || !decodedToken.session_id) {
                throw new BadRequestException("Invalid refresh token", ErrorCode.AUTH_INVALID_TOKEN);
            }

            const [existingUser] = await db.select().from(user).where(eq(user.id, decodedToken.user_id));
            if (!existingUser) {
                throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
            }

            const [existingSession] = await db
                .select()
                .from(session)
                .where(eq(session.id, decodedToken.session_id as string));

            if (!existingSession) {
                throw new BadRequestException("Session not found", ErrorCode.AUTH_NOT_FOUND);
            }

            console.log("we are processing refresh token")

            // ✅ Check session expiration
            const now = new Date();
            if (existingSession.expires_at && new Date(existingSession.expires_at) <= now) {
                systemLogger.warn(`Session ${existingSession.id} has expired for user ${decodedToken.user_id}`);
                throw new BadRequestException("Session has expired", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);
            }

            // ✅ Check token reuse
            if (!existingUser.refresh_token || !existingUser.refresh_token.includes(refreshToken)) {
                systemLogger.error(`Potential token compromise detected for user ${decodedToken.user_id}`);
                throw new BadRequestException("Invalid or compromised refresh token", ErrorCode.AUTH_INVALID_TOKEN);
            }

            // ✅ Generate and rotate tokens
            const tokenPayload: TokenPayload = {
                user_id: existingUser.id,
                aud: AudienceType.MobileApp,
                session_id: existingSession.id,
            };

            const newAccessToken = jwtUtility.signToken('access', tokenPayload, AccessTokenSignOptions);
            const newRefreshToken = jwtUtility.signToken('refresh', tokenPayload, RefreshTokenSignOptions);

            await db.transaction(async (tx) => {
                const updatedRefreshTokens = (existingUser.refresh_token || []).filter((token) => token !== refreshToken);
                updatedRefreshTokens.push(newRefreshToken);

                await tx.update(user).set({ refresh_token: updatedRefreshTokens }).where(eq(user.id, existingUser.id));
            });

            systemLogger.info(`Refresh token successfully used for user ${decodedToken.user_id}`);

            console.log("hello we fucking go here")


            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };


        } catch (error) {
            systemLogger.error(`Error during refresh token process: ${error}`);
            throw new BadRequestException("Failed to refresh token", ErrorCode.AUTH_INVALID_TOKEN);
        }
    }

    public async logout(refreshToken: string): Promise<{ success: true }> {

        if (!refreshToken) {
            throw new BadRequestException("Refresh token is required", ErrorCode.BAD_REQUEST);
        }

        try {
            // Decode and verify the refresh token
            const decoded = jwtUtility.decodeToken(refreshToken);

            console.log(decoded, "this is the decoded token")

            const decodedToken = jwtUtility.verifyRefreshToken(refreshToken, {
                audience: AudienceType.MobileApp,
                subject: decoded?.sub as string,
                issuer: decoded?.iss as string
            }) as TokenPayload;;

            if (!decodedToken || !decodedToken.user_id || !decodedToken.session_id) {
                throw new BadRequestException("Invalid refresh token", ErrorCode.AUTH_INVALID_TOKEN);
            }

            const [existingUser] = await db.select().from(user).where(eq(user.id, decodedToken.user_id));
            if (!existingUser) {
                throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
            }

            const [existingSession] = await db
                .select()
                .from(session)
                .where(eq(session.id, decodedToken.session_id as string));

            if (!existingSession) {
                systemLogger.warn(`Session already removed for user ${decodedToken.user_id}`);
            }

            const RETRY_KEY_FULL = `${this.RETRY_KEY}${existingUser.id}`


            cache.del(RETRY_KEY_FULL);


            await db.transaction(async (tx) => {
                // Remove session
                if (existingSession) {
                    await tx.delete(session).where(eq(session.id, decodedToken.session_id as string));
                }

                // Remove the refresh token from user's list
                const updatedTokens = (existingUser.refresh_token || []).filter((t) => t !== refreshToken);

                await tx.update(user).set({ refresh_token: updatedTokens }).where(eq(user.id, existingUser.id));
            });

            systemLogger.info(`User ${decodedToken.user_id} successfully logged out and session ${decodedToken.session_id} terminated`);
            return { success: true };

        } catch (error) {
            systemLogger.error(`Logout error: ${error}`);
            throw new BadRequestException("Logout failed", ErrorCode.AUTH_INVALID_TOKEN);
        }
    }

}