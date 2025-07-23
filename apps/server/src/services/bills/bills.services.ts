import { eq } from "drizzle-orm";
import { ErrorCode } from "../../@types/errorCode.enum";
import db from "../../db/connectDb";
import { accounts } from "../../db/schema/account.model";
import { billPayment } from "../../db/schema/billPayment.model";
import AnchorApi from "../../providers/anchor/anchor.modules";
import { AirtimePurchaseOptions, DataPurchaseOptions } from "../../providers/anchor/anchor.types";
import { BadRequestException } from "../../utils/error";
import { generateRef } from "../../utils/generateRef";
import { systemLogger } from "../../utils/logger";
import { AirtimePaymentType, DataPaymentType } from "./bills.types";

type CreateBillPaymentType = typeof billPayment.$inferInsert

class BillsServices {


    public async createAirtimePurchase(data: AirtimePaymentType, userId: string) {


        await db.transaction(async (tx) => {


            const [userAccount] = await tx.select().from(accounts).where(eq(accounts.id, data.accountId))


            if (!userAccount) {
                throw new BadRequestException("Account cannot be found", ErrorCode.AUTH_NOT_FOUND);
            }

            // Check Account Status
            if (userAccount.status === "blocked") {
                throw new BadRequestException("This account has been blocked from processing transactions", ErrorCode.ACCESS_UNAUTHORIZED);
            }

            // Check Sufficient Balance
            if (userAccount.balance < data.amount) {
                systemLogger.info(`Insufficient funds for user with accountId ${data.accountId}`);
                throw new BadRequestException("Insufficient Funds", ErrorCode.BAD_REQUEST);
            }


            const reference = generateRef("bil", 8)

            const payload: AirtimePurchaseOptions = {
                account: {
                    id: data.accountId,
                    type: "DepositAccount"
                },
                type: "Airtime",
                attributes: {
                    amount: data.amount,
                    phoneNumber: data.phoneNumber,
                    provider: data.provider,
                    reference: reference
                }
            }


            const response = await AnchorApi.bills.createBillPayment<'Airtime'>(payload, 'Airtime')

            if (response.data?.data.errors?.length) {
                systemLogger.error("Airtime purchase failed", {
                    errors: response.data.data.errors,
                });
                throw new BadRequestException("Airtime purchase failed", ErrorCode.BAD_REQUEST);
            }


            // subtract the balance from the user account


            const newBalance = userAccount.balance - data.amount

            await tx.update(accounts).set({ balance: newBalance })


            const billPaymentPayload: CreateBillPaymentType = {
                provider: data.provider,
                type: "airtime",
                reference,
                status: "PENDING",
                user_id: userId,
                external_bill_id: response.data?.data.id,
                amount: data.amount,
                attributes: {
                    phone_number: data.phoneNumber,
                }
            }


            await tx.insert(billPayment).values(billPaymentPayload)


        })






    }

    public async createDataPurchase(data: DataPaymentType, userId: string) {


        await db.transaction(async (tx) => {


            const [userAccount] = await tx.select().from(accounts).where(eq(accounts.id, data.accountId))


            if (!userAccount) {
                throw new BadRequestException("Account cannot be found", ErrorCode.AUTH_NOT_FOUND);
            }

            // Check Account Status
            if (userAccount.status === "blocked") {
                throw new BadRequestException("This account has been blocked from processing transactions", ErrorCode.ACCESS_UNAUTHORIZED);
            }

            // Check Sufficient Balance
            if (userAccount.balance < data.amount) {
                systemLogger.info(`Insufficient funds for user with accountId ${data.accountId}`);
                throw new BadRequestException("Insufficient Funds", ErrorCode.BAD_REQUEST);
            }


            const reference = generateRef("bil", 8)

            const payload: DataPurchaseOptions = {
                account: {
                    id: data.accountId,
                    type: "DepositAccount"
                },
                type: "Data",
                attributes: {
                    amount: data.amount,
                    phoneNumber: data.phoneNumber,
                    provider: data.provider,
                    reference: reference,
                    productSlug: data.productSlug
                }
            }


            const response = await AnchorApi.bills.createBillPayment<'Data'>(payload, 'Data')

            if (response.data?.data.errors?.length) {
                systemLogger.error("Airtime purchase failed", {
                    errors: response.data.data.errors,
                });
                throw new BadRequestException("Airtime purchase failed", ErrorCode.BAD_REQUEST);
            }


            // subtract the balance from the user account


            const newBalance = userAccount.balance - data.amount

            await tx.update(accounts).set({ balance: newBalance })


            const billPaymentPayload: CreateBillPaymentType = {
                provider: data.provider,
                type: "airtime",
                reference,
                status: "PENDING",
                user_id: userId,
                external_bill_id: response.data?.data.id,
                amount: data.amount,
                attributes: {
                    phone_number: data.phoneNumber,
                }
            }


            await tx.insert(billPayment).values(billPaymentPayload)


        })






    }



}

const billsServices = new BillsServices()
export default billsServices