import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AddBvnTypeSchema, UserAddressTypeSchema, UserEmailAndPasswordSchema, UserProfileDataSchema } from "./user.types";
import { authControllers, authService } from "../auth/auth.modules";
import userServices from "./user.services";
import { HTTPSTATUS } from "../../config/statusCode.config";
import { passcodeVerificationValidation, pinValidation } from "../auth/auth.validations";


class UserControllers {

    public createEmailAndPassword = asyncHandler(async (req: Request, res: Response) => {


        const data = UserEmailAndPasswordSchema.parse({ ...req.body })
        const user = req.user


        try {

            await userServices.createUserEmailAndPassword({ ...data }, user.id)

            return res.status(HTTPSTATUS.OK).json({
                success: true,
                message: "Email and Password succesfully created",

            })

        } catch (error) {
            console.log(error, "this is the error")
            return res.status(HTTPSTATUS.BAD_GATEWAY).json({
                success: false,
                message: "Failed to create email and password",

            })
        }


    })


    public createUserProfile = asyncHandler(async (req: Request, res: Response) => {

        const data = UserProfileDataSchema.parse({ ...req.body })
        const user = req.user

        await userServices.createUserProfile({ ...data }, user.id)

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Profile created successful",

        })
    })



    public createUserAddress = asyncHandler(async (req: Request, res: Response) => {

        const data = UserAddressTypeSchema.parse({ ...req.body })
        const user = req.user

        await userServices.addUserAddress(user.id, { ...data },)

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "User Address added successfully",

        })
    })

    public createPasscode = asyncHandler(async (req: Request, res: Response) => {


        const { passcode } = passcodeVerificationValidation.parse({ ...req.body })
        const user = req.user

        await userServices.createPasscode(user.id, passcode)


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Passcode Created Succesfully",

        })

    })

    public createSecurePinController = asyncHandler(async (req: Request, res: Response) => {


        const { pin } = pinValidation.parse({ ...req.body })
        const user = req.user

        await userServices.createSecurePin(user.id, pin)


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Passcode Created Succesfully",

        })

    })


    public addBvn = asyncHandler(async (req: Request, res: Response) => {


        const { bvn } = AddBvnTypeSchema.parse({ ...req.body })
        const user = req.user

        await userServices.addBVN(user.id, bvn)


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Passcode Created Succesfully",

        })

    })


    public getUserController = asyncHandler(async (req: Request, res: Response) => {

        const user = req.user

        const data = await userServices.getUser(user.id)



        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Customer gotten successfully",
            data: data
        })

    })


    public completeOnboardingController = asyncHandler(async (req: Request, res: Response) => {

        const user = req.user

        const data = await userServices.completeUserOnboarding(user.id)


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Onboarding completed successfully",
            data: data
        })

    })





}

const userControllers = new UserControllers()
export default userControllers