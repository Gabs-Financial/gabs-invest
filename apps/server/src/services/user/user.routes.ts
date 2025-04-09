import {Router} from "express"
import userServices from "./user.services"
import userControllers from "./user.controllers"


const userRouter = Router()


userRouter.post("/create_profile", userControllers.createUserProfile )
userRouter.post("/verify_email", userControllers.createEmailAndPassword)
userRouter.post("/add_address", userControllers.createUserAddress)
userRouter.post("/create_passcode", userControllers.createPasscode)
userRouter.post("/verify_bvn", userControllers.addBvn)
userRouter.post("/secure_pin", userControllers.createSecurePinController)
userRouter.post("/complete_onboarding", userControllers.completeOnboardingController)


userRouter.get("/customer", userControllers.getUserController)


export default userRouter