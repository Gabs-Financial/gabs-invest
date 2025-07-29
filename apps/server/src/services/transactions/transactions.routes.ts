import express from "express"
import transactionControllers from "./transactions.controllers"


const transactionRouter = express.Router()


transactionRouter.get('/', transactionControllers.listAllUserTransactions)
transactionRouter.get("/:transactionId", transactionControllers.fetchTransactionById)


export default transactionRouter