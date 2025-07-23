import { and, eq } from "drizzle-orm";
import db from "../../db/connectDb";
import { transactions } from "../../db/schema/transaction.model";
import { user } from "../../db/schema/user.model";

type CreateTransactionType = typeof transactions.$inferInsert;

class TransactionServices {



    public async createTransaction(
        data: CreateTransactionType,
        tx?: any
    ): Promise<CreateTransactionType> {
        const dbClient = tx ?? db;

        const [transactionRecord] = await dbClient.insert(transactions).values(data).returning({
            id: transactions.id,
            user_id: transactions.user_id,
            account_id: transactions.account_id,
            reference: transactions.reference,
            narration: transactions.narration,
            fee: transactions.fee,
            transfer_type: transactions.transfer_type,
            transaction_type: transactions.transaction_type,
            balance_before: transactions.balance_before,
            balance_after: transactions.balance_after,
            currency: transactions.currency,
            summary: transactions.summary,
            sender: transactions.sender,
            recipient: transactions.recipient,
            meta_data: transactions.meta_data,
            session_id: transactions.session_id,
            amount: transactions.amount,
            payment_amount: transactions.payment_amount,
            status: transactions.status,
            initiated_at: transactions.initiated_at,
            completed_at: transactions.completed_at,
            failure_reason: transactions.failure_reason,
            channel: transactions.channel,
            external_reference: transactions.external_reference,
            created_at: transactions.created_at,
            updated_at: transactions.updated_at,
        });

        return transactionRecord;
    }


    public async getUserTransactions(userId:string):Promise<CreateTransactionType[]> {

        const transactionsData = await db.query.transactions.findMany({
            where: eq(user.id, userId)
        })

        return transactionsData

    }

    public async getTransactionById(transactionId:string) {

        const [transaction] = await db.select().from(transactions).where(and( eq(transactions.id, transactionId)))


        return transaction

    }


    public async getAllTransactions(): Promise<CreateTransactionType[]>{

        const transactionsData = await db.query.transactions.findMany()

        return transactionsData

    }
}

const transactionServices = new TransactionServices();
export default transactionServices;