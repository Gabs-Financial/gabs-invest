import { Router } from "express";
import { fetchBankListController } from "./payment.controllers";

const paymentRouter = Router();

paymentRouter.get("/bank_list", fetchBankListController)

export default paymentRouter