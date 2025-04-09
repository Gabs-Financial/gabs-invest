import { Router } from "express";
import { authControllers } from "./auth.modules";



const authRouter = Router();



authRouter.post("/register", authControllers.register)
authRouter.post("/verify_phone", authControllers.verifyPhoneNumberOtp)



export default authRouter;