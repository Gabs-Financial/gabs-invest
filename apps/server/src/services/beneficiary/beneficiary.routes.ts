import { Router } from "express"
import beneficiaryControllers from "./beneficiary.controllers"


const beneficiaryRouter = Router()


beneficiaryRouter.post('/', beneficiaryControllers.createBeneficiary)
beneficiaryRouter.get("/list", beneficiaryControllers.getUserBeneficiaryList)


export default beneficiaryRouter


