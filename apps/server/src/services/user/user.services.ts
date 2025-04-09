import { eq, exists } from "drizzle-orm";
import { user } from "../../db/schema/user.model";
import { BadRequestException } from "../../utils/error";
import db from "../../db/connectDb";
import { ErrorCode } from "../../@types/errorCode.enum";
import type { AddBvnType, UserAddressType, UserEmailAndPasswordType, UserProfileType } from "./user.types";
import { PasswordUtils } from "../../utils/password.utils";
import { generateRef } from "../../utils/generateRef";
import config from "../../config/app.config";
import { systemLogger } from "../../utils/logger";
import { Anchor_createAccountQueue } from "../../queue/queue-list";
import { QueueRegistry } from "../../queue/queue-registry";
import { CustomerData } from "../../providers/anchor/anchor.types";



class UserServices {

    public async createUserEmailAndPassword(data: UserEmailAndPasswordType, userId: string): Promise<void> {

        console.log(userId, "this is the user id")

        const { email, password } = data;


        await db.transaction(async (tx) => {


            const userExistsQuery = db.select().from(user).where(eq(user.email, email));
            const userExists = await tx.select().from(user).where(exists(userExistsQuery)).execute();

            if (userExists.length > 0) {
                throw new BadRequestException("A user with this email already exists", ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
            }

            const hashedPassword = await PasswordUtils.hashPassword(password);
            const referral_code = generateRef('sox', 7);
            const referral_link = `${config.DOMAIN}/register?ref=${referral_code}`;

            await tx
                .update(user)
                .set({ email, password: hashedPassword, referral_code, referral_link })
                .where(eq(user.id, userId))
                .returning({
                    email: user.email,
                    first_name: user.first_name,
                });
        });
    }

    public async createUserProfile(data: UserProfileType, userId: string): Promise<void> {


        const { firstName, lastName, dob, gender, middleName } = data

        await db.transaction(async (tx) => {



            await tx
                .update(user)
                .set({ first_name: firstName, last_name: lastName, middle_name: middleName, date_of_birth: dob, gender: gender })
                .where(eq(user.id, userId))
                .returning({
                    email: user.email,
                    first_name: user.first_name,
                });
        });


    }

    public async addUserAddress(userId: string, userAddressData: UserAddressType): Promise<void> {


        await db.transaction(async (tx) => {
            const userExists = await tx
                .select()
                .from(user)
                .where(eq(user.id, userId))

            if (userExists.length === 0) {
                throw new BadRequestException("User not found", ErrorCode.AUTH_NOT_FOUND);
            }

            await tx
                .update(user)
                .set({ address: { ...userAddressData }, is_address_verified: true })
                .where(eq(user.id, userId))
                .execute();
        });
    }

    public async addBVN(userId: string, bvn: string) {


        await db.transaction(async (tx) => {

            const hashedBvn = PasswordUtils.encryptCryptr(bvn)
            await tx.update(user).set({ bvn: hashedBvn, is_bvn_verified: true }).where(eq(user.id, userId))

        })
    }

    public async createPasscode(userId: string, passcode: string): Promise<void> {
        if (!passcode) {
            throw new BadRequestException("Passcode is required", ErrorCode.BAD_REQUEST);
        }

        const hashedPasscode = await PasswordUtils.hashPassword(passcode);

        try {
            await db.transaction(async (tx) => {

                const updatedRows = await tx
                    .update(user)
                    .set({ passcode: hashedPasscode, })
                    .where(eq(user.id, userId));

                if (updatedRows.rowCount === 0) {
                    throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
                }

                systemLogger.info(`Passcode successfully created for user ${userId}`);
            });
        } catch (error) {
            systemLogger.error(`Error creating passcode for user ${userId}: ${error}`);
            throw error;
        }
    }


    public async createSecurePin(userId: string, pin: string): Promise<void> {
        if (!pin) {
            throw new BadRequestException("Pin is required", ErrorCode.BAD_REQUEST);
        }

        console.log(pin, "this is the pi sent")

        const hashedPin = await PasswordUtils.hashPassword(pin);

        try {
            await db.transaction(async (tx) => {

                const updatedRows = await tx
                    .update(user)
                    .set({ secure_pin: hashedPin, has_created_transactionPin: true })
                    .where(eq(user.id, userId));

                if (updatedRows.rowCount === 0) {
                    throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
                }

                systemLogger.info(`Pin successfully created for user ${userId}`);
            });
        } catch (error) {
            console.log(error)
            systemLogger.error(`Error creating pin for user ${userId}: ${error}`);
            throw new BadRequestException('Failed to create pin');
        }
    }


    public async completeUserOnboarding(userId: string) {


        // Todo - Create user acnhor user
        // Todo - Create anchor deposit account
        // Todo - Create user account

        try {

            console.log("this is running the completed onboarding ")

            await db.transaction(async (tx) => {


                const [userRecord] = await tx
                    .select({
                        id: user.id,
                        email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        middle_name: user.middle_name,
                        date_of_birth: user.date_of_birth,
                        gender: user.gender,
                        address: user.address,
                        is_bvn_verified: user.is_bvn_verified,
                        referral_code: user.referral_code,
                        referral_link: user.referral_link,
                        kyc_level: user.kyc_level,
                        is_address_verified: user.is_address_verified,
                        has_created_transactionPin: user.has_created_transactionPin,
                        bvn: user.bvn,
                        phone_number: user.phone_number
                    })
                    .from(user)
                    .where(eq(user.id, userId))
                    .execute();


                if (!userRecord) {
                    throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
                }

                const decryptedBvn = PasswordUtils.decryptCryptr(userRecord.bvn as string)


                const anchor_payload: CustomerData<'level_2'> = {
                    bvn: decryptedBvn,
                    dateOfBirth: userRecord.date_of_birth as string,
                    email: userRecord.email as string,
                    firstName: userRecord.first_name as string,
                    lastName: userRecord.last_name as string,
                    phoneNumber: userRecord.phone_number as string,
                    gender: userRecord.gender as string,
                    middleName: userRecord.middle_name ?? "",
                    address: {
                        addressLine_1: (userRecord.address as { street: string }).street,
                        city: (userRecord.address as { city: string }).city,
                        country: "NG",
                        postalCode: (userRecord.address as { postalCode: string }).postalCode,
                        state: (userRecord.address as { state: string }).state,
                    },
                    userId: userRecord.id
                }

                await Anchor_createAccountQueue.add(QueueRegistry.create_anchor_account, anchor_payload)

                await tx
                    .update(user)
                    .set({ has_onboarded: true })
                    .where(eq(user.id, userId));



                systemLogger.info(` User  successfully completed onboarding ${userId}`);
            });
        } catch (error) {
            console.log(error)
            systemLogger.error(`Error onboarding user ${error}`);
            throw new BadRequestException('Failed to onboard user');
        }



    }


    public async getUser(userId: string) {

        const userRecord = await db
            .select({
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                middle_name: user.middle_name,
                date_of_birth: user.date_of_birth,
                gender: user.gender,
                address: user.address,
                is_bvn_verified: user.is_bvn_verified,
                referral_code: user.referral_code,
                referral_link: user.referral_link,
                kyc_level: user.kyc_level,
                is_address_verified: user.is_address_verified,
                has_created_transactionPin: user.has_created_transactionPin
            })
            .from(user)
            .where(eq(user.id, userId))
            .execute();

        if (userRecord.length === 0) {
            throw new BadRequestException("User not found", ErrorCode.AUTH_NOT_FOUND);
        }

        return userRecord[0];
    }





}

export default new UserServices()