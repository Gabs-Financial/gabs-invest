import { Router } from "express";
import paymentController from "./payment.controllers";

const paymentRouter = Router();

paymentRouter.get("/bank_list", paymentController.fetchBankListController)
paymentRouter.post("/resolve_account", paymentController.validateBankAccount)
paymentRouter.post("/transfer", paymentController.createTransferController)

export default paymentRouter