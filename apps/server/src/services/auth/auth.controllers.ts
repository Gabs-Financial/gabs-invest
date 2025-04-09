import { HTTPSTATUS } from "../../config/statusCode.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { setCookies } from "../../utils/cookies.utils";
import AuthServices from "./auth.services";
import { passcodeVerificationValidation, phoneNumberVerificationValidation, registrationValidationSchema } from "./auth.validations";
import { Request, Response } from "express";


export enum medium {
    Friend = "friend",
    Referral = "referral",
    Facebook = "facebook",
    Instagram = "instagram",
    Twitter = "twitter",
    Google = "google",
    LinkedIn = "linkedin",
    Others = "others",
}


class AuthControllers {

    private authService: AuthServices;

    constructor(authService: AuthServices) {
        this.authService = authService;
    }


    public register  = asyncHandler(async(req:Request, res:Response) => {

        const { phoneNumber } = registrationValidationSchema.parse({ ...req.body })


        await this.authService.registerUser({ phoneNumber })

        return res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Verification code sent successfully",
           
        })

    })


    public verifyPhoneNumberOtp = asyncHandler(async(req:Request, res:Response) => {

        const {otp, phoneNumber} = phoneNumberVerificationValidation.parse({...req.body})

       const {id,accessToken, refreshToken} = await this.authService.verifyPhoneNumber(phoneNumber, otp)


        setCookies({ res, accessToken, refreshToken })


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Phone number verified successfully",
            data:{
                userId: id,
                accessToken,
                refreshToken
            }
        })

    })





}


export default AuthControllers;