import { Request, Response } from "express"
import { asyncHandler } from "../../middlewares/asyncHandler"
import walletServices from "./wallet.services"
import { HTTPSTATUS } from "../../config/statusCode.config"


class WalletControllers {


    public getUserWallet = asyncHandler(async (req: Request, res: Response) => {

        const userId = req.user.id

        const response = await walletServices.getUserWallet(userId)


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Wallet fetched succesfully",
            data: response
        });


    })


    public getUserBalance = asyncHandler(async (req: Request, res: Response) => {

        const userId = req.user.id

        const response = await walletServices.getUserWalletBalance(userId)


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Balance fetched succesfully",
            data: response
        });


    })



}

const walletControllers = new WalletControllers()

export default walletControllers