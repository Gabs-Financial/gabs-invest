import { Router } from "express";
import { authControllers } from "./auth.modules";
import { authMiddleware } from "../../middlewares/protected.middleware";



const authRouter = Router();



authRouter.post("/register", authControllers.register)
authRouter.post("/login", authControllers.login)
authRouter.post("/logout", authControllers.logOut)
authRouter.post("/verify_phone", authControllers.verifyPhoneNumberOtp)
authRouter.post("/refresh_token", authControllers.refreshToken)
authRouter.post("/resend_otp", authControllers.resendOtp)
authRouter.post("/verify_passcode",authMiddleware, authControllers.verifyPasscode)



export default authRouter;