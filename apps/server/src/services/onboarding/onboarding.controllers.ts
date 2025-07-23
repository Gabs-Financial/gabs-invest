import { eq } from "drizzle-orm"
import { HTTPSTATUS } from "../../config/statusCode.config"
import { setup } from "../../db/schema/setup.model"
import { asyncHandler } from "../../middlewares/asyncHandler"
import userServices from "../user/user.services"
import { bvnSchema, createPasswordShcema, passcodeSchema, UserAddressTypeSchema, UserEmailAndPasswordSchema, verifyBvnWithPhone } from "./onboarding.types"
import { Request, Response } from "express"
import db from "../../db/connectDb"
import verificationServicea from "../verification/verification.services"
import { PasswordUtils } from "../../utils/password.utils"
import { user } from "../../db/schema/user.model"
import { sendOtp } from "../../helpers/sendOtp"
import { Anchor_createAccountQueue } from "../../queue/queue-list"
import { QueueRegistry } from "../../queue/queue-registry"
import { CustomerData } from "../../providers/anchor/anchor.types"
import { BadRequestException, NotFoundException } from "../../utils/error"
import { ErrorCode } from "../../@types/errorCode.enum"
import { systemLogger } from "../../utils/logger"
import cache from "../../config/node-cache"



class OnboardingControllers {

    public createEmail = asyncHandler(async (req: Request, res: Response) => {


        const data = UserEmailAndPasswordSchema.parse({ ...req.body })
        const user = req.user

        await userServices.createUserEmail({ ...data }, user.id)


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Email added succesfully created",

        })




    })

    public addBvn = asyncHandler(async (req: Request, res: Response) => {

        const { bvn } = bvnSchema.parse({ ...req.body })
        const userId = req.user.id

        const userBvnData = await verificationServicea.verifyUserBvn(bvn)

        const hashedBvn = PasswordUtils.encryptCryptr(bvn)

        const payload: Partial<Record<keyof typeof user.$inferInsert, any>> = {
            first_name: userBvnData.data.entity?.first_name,
            last_name: userBvnData.data.entity?.last_name,
            gender: userBvnData.data.entity?.gender?.toLocaleLowerCase(),
            middle_name: userBvnData.data.entity?.middle_name,
            bvn_phone_number: userBvnData.data.entity?.phone_number1,
            state_of_origin: userBvnData.data.entity?.state_of_origin,
            date_of_birth: userBvnData.data.entity?.date_of_birth,
            bvn: hashedBvn,
            full_name: `${userBvnData.data.entity?.first_name} ${userBvnData.data.entity?.last_name}`,
            kyc_level: 1,

        }

        await userServices.updateUser(payload, userId)

        const userRecord = await userServices.getUser(userId)

        await sendOtp(payload.bvn_phone_number)

        await db.transaction(async (tx) => {
            tx.update(setup).set({ is_bvn_provided: true })
        })



        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "User Bvn provided succesfully"
        })

    })


    public createPassword = asyncHandler(async (req: Request, res: Response) => {

        const userId = req.user.id

        const { password } = createPasswordShcema.parse({ ...req.body })


        const hashedPassword = await PasswordUtils.hashPassword(password);



        await db.transaction(async (tx) => {

           await tx.update(user).set({ password: hashedPassword }).where(eq(user.id, userId))
           await tx.update(setup).set({ is_password_created: true }).where(eq(setup.user_id, userId))
        })


        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Your password has been created successfully"
        })


    })


    public createPasscode = asyncHandler(async (req: Request, res: Response) => {

        const { passcode } = passcodeSchema.parse({ ...req.body })

        const userId = req.user.id

        const hashedPasscode = await PasswordUtils.hashPassword(passcode);

        try {
            await db.transaction(async (tx) => {

                await tx
                    .update(user)
                    .set({ passcode: hashedPasscode, })
                    .where(eq(user.id, userId));

                await tx.update(setup).set({ has_created_passcode: true }).where(eq(setup.user_id, userId));

                systemLogger.info(`Passcode successfully created for user ${userId}`);


                return res.status(HTTPSTATUS.OK).json({
                    success: true,
                    message: "Passcode created succesully",

                })

            });
        } catch (error) {
            systemLogger.error(`Error creating passcode for user ${userId}: ${error}`);
            throw error;
        }
    })

    public createUserAddress = asyncHandler(async (req: Request, res: Response) => {

        const { city, postalCode, state, street } = UserAddressTypeSchema.parse({ ...req.body })


        const userId = req.user.id

        await userServices.updateUser({ address: { street, city, state, postalCode } }, userId)
        await db.update(setup).set({ is_address_provided: true }).where(eq(setup.user_id, userId)).execute()



        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "User Address added successfully",

        })
    })

    public verifyIdentityWithBvnPhoneNumber = asyncHandler(async (req: Request, res: Response) => {


        const { code } = verifyBvnWithPhone.parse({ ...req.body })
        const userId = req.user.id

        const userRecord = await userServices.getUser(userId)

        if (!userRecord) {
            throw new NotFoundException("User not found", ErrorCode.AUTH_NOT_FOUND);
        }

        const phoneNumber = userRecord.bvn_phone_number as string

        const value = cache.take(phoneNumber);

        if (!value || value !== code) {
            systemLogger.error(`Invalid or expired OTP for ${phoneNumber}`);
            throw new BadRequestException("Invalid or Expired OTP", ErrorCode.AUTH_INVALID_TOKEN);
        }

        await db.transaction(async (tx) => {
            tx.update(setup).set({ is_identity_verified: true })
        })

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "BVN verified successfully with phone",
        });


    })

    public completeUserOnboarding = asyncHandler(async (req: Request, res: Response) => {

        const userId = req.user.id

        const userRecord = await userServices.getUser(userId)

        const decryptedBvn = PasswordUtils.decryptCryptr(userRecord.bvn as string)

        const anchor_payload: CustomerData<'level_2'> = {
            bvn: decryptedBvn,
            dateOfBirth: userRecord.date_of_birth as string,
            email: userRecord.email as string,
            firstName: userRecord.first_name as string,
            lastName: userRecord.last_name as string,
            phoneNumber: userRecord.bvn_phone_number as string,
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


        await userServices.updateUser({ has_onboarded: true }, userId)
        await db.update(setup).set({ has_completed_onboarding: true }).where(eq(setup.user_id, userId))


        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Onboarding completed successfully"
        })

    })





}


const onboardingControllers = new OnboardingControllers()
export default onboardingControllers