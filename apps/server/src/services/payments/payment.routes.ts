import { Router } from "express";
import paymentController from "./payment.controllers";

const paymentRouter = Router();

paymentRouter.get("/bank_list", paymentController.fetchBankListController)
paymentRouter.post("/resolve/account", paymentController.validateBankAccount)
paymentRouter.post("/resolve/identifier", paymentController.resolveAccountIndetifier)
paymentRouter.post("/transfer/nip", paymentController.nipTransferController)
paymentRouter.post("/transfer/book", paymentController.bookTransferController)
paymentRouter.post("/counterparty", paymentController.createCounterParty)

export default paymentRouter