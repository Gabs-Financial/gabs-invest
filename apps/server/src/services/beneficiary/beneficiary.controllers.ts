import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { createBeneficiarySchema } from "./beneficiary.types";
import beneficiaryServices from "./beneficiary.services";
import { HTTPSTATUS } from "../../config/statusCode.config";



class BeneficiaryControllers {

    public createBeneficiary = asyncHandler(async (req: Request, res: Response) => {

        const userId = req.user.id

        const { accountName, accountNumber, bankCode, bankName } = createBeneficiarySchema.parse({ ...req.body })

        const response = await beneficiaryServices.createBeneficiary({
            accountName,
            accountNumber,
            bankCode,
            bankName
        }, userId)

        return res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Beneficiary created successfully",
            data: response
        })

    })

}

const beneficiaryControllers = new BeneficiaryControllers()

export default beneficiaryControllers