import { Router } from "express"
import userServices from "./user.services"
import userControllers from "./user.controllers"
import upload from "../../middlewares/upload.middleware"


const userRouter = Router()




userRouter.get("/check_tag", userControllers.checkTagExist)
userRouter.post("/tag", userControllers.createTag)
userRouter.post("/avatar",upload.single('avatar'), userControllers.createTag)

userRouter.get("/customer", userControllers.getUserController)


export default userRouter