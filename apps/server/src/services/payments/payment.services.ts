import AnchorMiacApi from "../../providers/anchor/anchor-miac-api";
import { BadRequestException, NotFoundException } from "../../utils/error";
import { ErrorCode } from "../../@types/errorCode.enum";
import { CreateBookTransferType, CreateNipTransferType, CreateTransferType } from "./payment.types";
import { AnchorBookTransfer, AnchorTransferResponseType, AnchorTransferType, CreateCounterPartyType, TransferType } from "../../providers/anchor/anchor.types";
import AnchorApi from "../../providers/anchor/anchor.modules"
import db from "../../db/connectDb";
import { accounts } from "../../db/schema/account.model";
import { eq } from "drizzle-orm";
import { systemLogger } from "../../utils/logger";
import { generateRef } from "../../utils/generateRef";
import transactionServices from "../transactions/transactions.services";
import beneficiaryServices from "../beneficiary/beneficiary.services";
import { beneficiary, BeneficiaryInsertType } from "../../db/schema/beneficiary.model";



class PaymentServices {


    public async fetchBankList() {

        try {
            const response = await AnchorMiacApi.fetchBankList();
            return response.data

        } catch (error: unknown) {
            return new BadRequestException("Error fetching bank list", ErrorCode.BAD_REQUEST);
        }
    }




    async createNIPTransfer(data: CreateNipTransferType, userId: string) {

        try {

            const {
                accountNumber,
                accountName,
                amount,
                bankName,
                reason,
                bankCode,
                counterPartyId
            } = data;

            const reference = generateRef("trx_", 8, false);

            const accountRecord = await db.query.accounts.findFirst({
                where: eq(accounts.user_id, userId)
            })

            if (!accountRecord) {
                throw new NotFoundException("Wallet not found ", ErrorCode.AUTH_NOT_FOUND)
            }

            const nipTransferPayload: AnchorTransferType = {
                accountId: accountRecord?.provider_account_id,
                accountType: "DepositAccount",
                amount,
                counterPartyId,
                reference,
                currency: "NGN",
                type: "NIPTransfer",
                reason,
            };

            const transferResponse = await AnchorApi.payments.createNipTransfer(nipTransferPayload);

            if (transferResponse.data?.data.errors?.length) {
                systemLogger.error("Failed to make NIP transfer", {
                    errors: transferResponse.data.data.errors,
                });
                throw new BadRequestException("Failed to make NIP transfer", ErrorCode.BAD_REQUEST);
            }

          const transactionData =   await transactionServices.createTransaction(
                {
                    account_id: accountRecord.id,
                    amount,
                    recipient: {
                        account_name: accountName,
                        account_number: accountNumber,
                        bank_code: bankCode,
                        bank_name: bankName,
                    },
                    reference,
                    transfer_type: "debit",
                    transaction_type: "NIP_Transfer",
                    user_id: userId,
                    status: "PENDING",
                    
                },
            );

            return transactionData

        } catch (error) {
            console.error(error, "this is the error from the nip transfer")
            systemLogger.error("Error creating NIP transfer", { error });
            throw new BadRequestException("Error processing transfer", ErrorCode.BAD_REQUEST);
        }
    }


    protected async createBookTransfer(data: CreateBookTransferType, userId: string) {

        try {
            const {

                amount,
                destinationAccountId,
                destinationAccountType,
                type,
                currency,
                reason,
                id,
            } = data;

            const reference = generateRef("trx_", 8, false);

            const bookTransferPayload: AnchorBookTransfer = {
                accountId,
                accountType,
                amount,
                destinationAccountId,
                destinationAccountType,
                type,
                currency: currency as "NGN",
                reason,
                reference,
            };

            const response = await AnchorApi.payments.createBookTransfer(bookTransferPayload);

            if (response.data?.data.errors?.length) {
                systemLogger.error("Failed to make book transfer", {
                    errors: response.data.data.errors,
                });
                throw new BadRequestException("Failed to make book transfer", ErrorCode.BAD_REQUEST);
            }

            // Fetch destination account before transaction
            const [destinationAccount] = await db
                .select()
                .from(accounts)
                .where(eq(accounts.provider_account_id, destinationAccountId));

            if (!destinationAccount) {
                throw new BadRequestException("Destination account not found", ErrorCode.AUTH_NOT_FOUND);
            }

            await db.transaction(async (tx) => {
                await beneficiaryServices.createBeneficiary(
                    {
                        accountName: destinationAccount.account_name,
                        accountNumber: destinationAccount.account_number,
                        bankCode: destinationAccount.bank_code,
                        bankName: destinationAccount.bank_name,
                    },
                    userId,
                    tx
                );

                await transactionServices.createTransaction(
                    {
                        account_id: id,
                        amount,
                        recipient: {
                            account_name: destinationAccount.account_name,
                            account_number: destinationAccount.account_number,
                            bank_code: destinationAccount.bank_code,
                            bank_name: destinationAccount.bank_name,
                        },
                        reference,
                        transfer_type: "debit",
                        transaction_type: "Book_Transfer",
                        user_id: userId,
                        status: "PENDING",
                    },
                    tx
                );
            });
        } catch (error) {
            systemLogger.error("Error creating book transfer", { error });
            throw new BadRequestException("Failed to make book transfer", ErrorCode.BAD_REQUEST);
        }
    }



    public async createTransfer<T extends TransferType>(data: CreateTransferType<T>, type: T, userId: string) {
        const { amount, id } = data;

        // Retrieve User Account
        const [userAccount] = await db.select().from(accounts).where(eq(accounts.id, id));

        if (!userAccount) {
            throw new BadRequestException("Account cannot be found", ErrorCode.AUTH_NOT_FOUND);
        }

        // Check Account Status
        if (userAccount.status === "blocked") {
            throw new BadRequestException("This account has been blocked from processing transactions", ErrorCode.ACCESS_UNAUTHORIZED);
        }

        // Check Sufficient Balance
        if (userAccount.balance < amount) {
            systemLogger.info(`Insufficient funds for user with accountId ${id}`);
            throw new BadRequestException("Insufficient Funds", ErrorCode.BAD_REQUEST);
        }

        // Proceed with Transfer
        switch (type) {
            case "NIPTransfer":
                return await this.createNIPTransfer({
                    ...data,
                    accountId: userAccount.provider_account_id,
                } as CreateTransferType<"NIPTransfer">, userId);

            case "BookTransfer":
                return await this.createBookTransfer({
                    ...data,
                    accountId: userAccount.provider_account_id,
                } as CreateTransferType<"BookTransfer">, userId);

            default:
                throw new BadRequestException("Invalid transfer type", ErrorCode.BAD_REQUEST);
        }
    }

    public async resolveAccount(data: { bankCode: string, accountNumber: string }) {

        try {



            const response = await AnchorApi.payments.resolveAccount({ accountNumber: data.accountNumber, BankCode: data.bankCode })

            const formattedResponse = {
                accountName: response.data.data.attributes.accountName,
                accountNumber: response.data.data.attributes.accountNumber,
                bankName: response.data.data.attributes.bank.name
            }

            return formattedResponse

        } catch (error) {
            throw new BadRequestException("Invalid account", ErrorCode.BAD_REQUEST)
        }

    }

    public async createCounterParty(data: CreateCounterPartyType) {

        const { accountName, accountNumber, bankCode, verifyName } = data

        try {

            const response = await AnchorApi.counterparty.create({ accountName, accountNumber, bankCode, verifyName: true })

            if (response.data?.data.errors?.length) {
                systemLogger.error("Failed to counter party ", {
                    errors: response.data.data.errors,
                });
                throw new BadRequestException("Failed to create counterparty", ErrorCode.BAD_REQUEST);
            }

            console.log(response.data.data, "this is from the conterparty shit things")

            return {
                counterparty_id: response.data.data.id,
                account_name: response.data.data.attributes.accountName,
                account_number: response.data.data.attributes.accountNumber,
                bank_code: response.data.data.attributes.bank.nipCode,
                bank_name: response.data.data.attributes.bank.name
            }


        } catch (error) {
            systemLogger.error("Error creating counter party", { error });
            throw new BadRequestException("Failed to create counterparty", ErrorCode.BAD_REQUEST);
        }

    }

}


const paymentServices = new PaymentServices()
export default paymentServices