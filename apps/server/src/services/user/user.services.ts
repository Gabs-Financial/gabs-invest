import { eq, exists } from "drizzle-orm";
import { user } from "../../db/schema/user.model";
import { BadRequestException } from "../../utils/error";
import db from "../../db/connectDb";
import { ErrorCode } from "../../@types/errorCode.enum";
import type { AddBvnType } from "./user.types";
import { PasswordUtils } from "../../utils/password.utils";
import { generateRef } from "../../utils/generateRef";
import config from "../../config/app.config";
import { systemLogger } from "../../utils/logger";
import { setup } from "../../db/schema/setup.model";



type UserType = typeof user.$inferInsert


class UserServices {

    public async createUserEmail(data: { email: string }, userId: string): Promise<void> {


        const { email } = data;


        await db.transaction(async (tx) => {


            const userExistsQuery = db.select().from(user).where(eq(user.email, email));
            const userExists = await tx.select().from(user).where(exists(userExistsQuery)).execute();

            if (userExists.length > 0) {
                throw new BadRequestException("A user with this email already exists", ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
            }

            const referral_code = generateRef('sox', 7);
            const referral_link = `${config.DOMAIN}/register?ref=${referral_code}`;

            await tx
                .update(user)
                .set({ email, referral_code, referral_link })
                .where(eq(user.id, userId))
                .returning({
                    email: user.email,
                    first_name: user.first_name,
                });

            await tx.update(setup).set({ is_email_added: true }).where(eq(setup.user_id, userId))

        });
    }


    public async updateUser(fields: Partial<Record<keyof UserType, any>>, userId: string): Promise<{ success: true }> {
        if (!userId) {
            throw new BadRequestException("User ID is required", ErrorCode.BAD_REQUEST);
        }

        if (!fields || Object.keys(fields).length === 0) {
            throw new BadRequestException("No fields provided for update", ErrorCode.BAD_REQUEST);
        }

        const sensitiveFields = ["passcode", "secure_pin", "refresh_token", "id", "phone_number"];

        const attemptedSensitiveUpdates = Object.keys(fields).filter((field) => sensitiveFields.includes(field));
        if (attemptedSensitiveUpdates.length > 0) {
            throw new BadRequestException(
                `Cannot update sensitive fields: ${attemptedSensitiveUpdates.join(", ")}`,
                ErrorCode.AUTH_UNAUTHORIZED_ACCESS
            );
        }

        try {
            const [existingUser] = await db.select().from(user).where(eq(user.id, userId));
            if (!existingUser) {
                throw new BadRequestException("User not found", ErrorCode.AUTH_USER_NOT_FOUND);
            }

            await db.transaction(async (tx) => {
                await tx.update(user).set(fields).where(eq(user.id, userId));
            });

            systemLogger.info(`User ${userId} successfully updated`);
            return { success: true };
        } catch (error) {
            systemLogger.error(`Error updating user ${userId}: ${error}`);
            throw new BadRequestException("Failed to update user", ErrorCode.BAD_REQUEST);
        }
    }


    public async createSecurePin(userId: string, pin: string): Promise<void> {
        if (!pin) {
            throw new BadRequestException("Pin is required", ErrorCode.BAD_REQUEST);
        }


        const hashedPin = await PasswordUtils.hashPassword(pin);

        try {
            await db.transaction(async (tx) => {

                const updatedRows = await tx
                    .update(user)
                    .set({ secure_pin: hashedPin })
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


    public async getUser(userId: string) {

        const userRecord = await db.query.user.findFirst({
            where: eq(user.id, userId),
            with: {
                setup: true
            }
        })


        if (!userRecord) {
            throw new BadRequestException("User not found", ErrorCode.AUTH_NOT_FOUND);
        }

        return userRecord;
    }



}

export default new UserServices()