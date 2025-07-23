import { asyncHandler } from "../../middlewares/asyncHandler";
import { Request, Response } from "express"
import transactionServices from "./transactions.services";
import { HTTPSTATUS } from "../../config/statusCode.config";



class TransactionControllers {

    public listAllUserTransactions = asyncHandler(async (req: Request, res: Response) => {

        const user = req.user
        const userId = req.params.userId

        const transactionsData = await transactionServices.getUserTransactions(user.id)

        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Transactions fteched successfully",
            data: transactionsData
        })

    })


    public fetchTransaction = asyncHandler(async (req: Request, res: Response) => {

        
        const transactionId = req.params.transctionId

        const transactionsData = await transactionServices.getTransactionById(transactionId)

        res.status(HTTPSTATUS.ACCEPTED).json({
            success: true,
            message: "Transactions fteched successfully",
            data: transactionsData
        })

    })




    

}


const transactionControllers = new TransactionControllers()
export default transactionControllers