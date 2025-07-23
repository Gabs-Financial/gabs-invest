import { Router } from "express";
import onboardingControllers from "./onboarding.controllers";


const onboardingRouter = Router()


onboardingRouter.post("/create_profile", onboardingControllers.createEmail)
onboardingRouter.post("/add_address", onboardingControllers.createUserAddress)
onboardingRouter.post("/bvn", onboardingControllers.addBvn)
onboardingRouter.post("/bvn/verify", onboardingControllers.verifyIdentityWithBvnPhoneNumber)
onboardingRouter.post("/passcode", onboardingControllers.createPasscode)
onboardingRouter.post("/complete", onboardingControllers.completeUserOnboarding)
onboardingRouter.post("/password", onboardingControllers.createPassword)




export default onboardingRouter