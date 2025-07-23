import { eq } from "drizzle-orm";
import db from "../../db/connectDb";
import { accounts } from "../../db/schema/account.model";
import AnchorApi from "../../providers/anchor/anchor.modules"
import { BadRequestException, NotFoundException } from "../../utils/error";
import { systemLogger } from "../../utils/logger";



class WalletServices {


    public async getUserWallet(userId: string) {

        const walletRecord = await db.query.accounts.findFirst({
            where: eq(accounts.user_id, userId),
        })

        return walletRecord

    }

    public async getUserWalletBalance(userId: string) {

        try {

            const walletRecord = await db.query.accounts.findFirst({
                where: eq(accounts.user_id, userId),
            })

            if (!walletRecord) {

                throw new NotFoundException("User account does not exist")

            }

            const response = await AnchorApi.account.fetchUserBalance(walletRecord?.provider_account_id)

            if (response?.data?.data.errors?.length) {

                return {
                    available_balance: walletRecord.available_balance,
                    ledgerBalance: walletRecord.ledger_balance
                }

            }

            return {
                available_balance: response.data.data.availableBalance,
                ledger_balance: response.data.data.ledgerBalance
            }


        } catch (error) {

            console.log(error)
            systemLogger.error(`Error fteching user balance ${userId}: ${error}`);
            throw new BadRequestException('Failed to fetch balance ');


        }

    }


}


const walletServices = new WalletServices()

export default walletServices