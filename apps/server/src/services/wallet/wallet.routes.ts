import { Router } from "express";
import walletControllers from "./wallet.controllers";


const walletRouter = Router();

walletRouter.get("/", walletControllers.getUserWallet)
walletRouter.get("/balance", walletControllers.getUserBalance)


export default walletRouter;