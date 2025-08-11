import { HTTPSTATUS } from "../../config/statusCode.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { setCookies } from "../../utils/cookies.utils";
import AuthServices from "./auth.services";
import { loginSchema, passcodeVerificationValidation, phoneNumberVerificationValidation, refreshTokenSchema, registrationValidationSchema } from "./auth.validations";
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


    public register = asyncHandler(async (req: Request, res: Response) => {

        const { phoneNumber } = registrationValidationSchema.parse({ ...req.body })

        await this.authService.registerUser({ phoneNumber })

        return res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Verification code sent successfully",

        })

    })

    public verifyPasscode = asyncHandler(async (req: Request, res: Response) => {

        const { passcode } = req.body;

        const userId =req.user.id

        const result = await this.authService.verifyPasscode(passcode, userId);

        if (result && result.has_exceeded_attempts) {
            return res.status(HTTPSTATUS.ACCEPTED).json({
                success: false,
                message: "Maximum passcode attempts exceeded. Your account has been flagged.",
                data: {
                    number_of_attempts: result.number_of_attempts,
                    has_exceeded_attempt: result.has_exceeded_attempts,
                },
            });
        }

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Passcode verified successfully",
        });
    });


    public refreshToken = asyncHandler(async (req: Request, res: Response) => {

        const { refreshToken: token } = refreshTokenSchema.parse({ ...req.body })

        const refreshTokenHeader = req.headers['x-refresh-token'];

        console.log(token, "this is the refresh token from the body")


        const { accessToken, refreshToken } = await this.authService.refreshToken(token);

        console.log("we are fteching the motherfucking refresh token")


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Retrived the access token succesfully",
            data: {
                accessToken,
                refreshToken
            }
        });
    });


    public verifyPhoneNumberOtp = asyncHandler(async (req: Request, res: Response) => {

        const { otp, phoneNumber } = phoneNumberVerificationValidation.parse({ ...req.body })

        const {  accessToken, refreshToken } = await this.authService.verifyPhoneNumber(phoneNumber, otp)




        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Phone number verified successfully",
            data: {
                accessToken,
                refreshToken
            }
        })

    })


    public login = asyncHandler(async (req: Request, res: Response)=> {

        const {password,phoneNumber} = loginSchema.parse({...req.body})



        const {accessToken, refreshToken} = await this.authService.login(phoneNumber, password)

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Login successfull",
            data: {
                accessToken,
                refreshToken
            }
        });

    })


    public resendOtp = asyncHandler(async (req: Request, res: Response) => {

        const { phoneNumber } = registrationValidationSchema.parse({ ...req.body })


        await this.authService.resendToken(phoneNumber as string);



        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Token resent succesfully",

        });
    });

    public logOut = asyncHandler(async (req: Request, res: Response) => {

        const refreshToken = req.headers['x-refresh-token'];

        await this.authService.logout(refreshToken as string);

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Logout succesful",
        });

    });
}


export default AuthControllers;