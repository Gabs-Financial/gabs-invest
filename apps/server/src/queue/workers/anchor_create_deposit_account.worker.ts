import { Job, MetricsTime, Worker } from "bullmq";
import { connection, QueueRegistry } from "../queue-registry";
import { systemLogger } from "../../utils/logger";
import db from "../../db/connectDb";
import { eq } from "drizzle-orm";
import { user } from "../../db/schema/user.model";
import AnchorApi from "../../providers/anchor/anchor.modules";
import { CreateDepositAccountData } from "../../providers/anchor/anchor.types";
import { accounts } from "../../db/schema/account.model";
import { ThirdPartyProviders } from "../../@types/types";
import { setup } from "../../db/schema/setup.model";

type AccountType = typeof accounts.$inferInsert;

const Anchor_createDepositAccountWorker = new Worker(
    QueueRegistry.create_anchor_account,
    async (job: Job) => {


        const { data }: { data: { userId: string;} } = job;

        try {
            await db.transaction(async (tx) => {

                const customer = await tx.query.user.findFirst({ where: eq(user.id, data.userId) });

                if (!customer) {
                    throw new Error(`Customer with ID ${data.userId} not found`);
                }

                const depositAccountPayload: CreateDepositAccountData = {
                    accountType: "SAVINGS",
                    customerId: (customer.providers as { anchor_provider_id: string }).anchor_provider_id,
                    customerType: "IndividualCustomer",
                    type: "DepositAccount",
                };

                const accountResponse = await AnchorApi.account.createDepositAccount(depositAccountPayload);

                if (accountResponse.data?.data.errors &&
                    accountResponse.data?.data.errors.length > 0) {
                    console.log(accountResponse, "this is the status of the response ")
                    throw new Error(accountResponse.data.errors || "Failed to create deposit account");
                }

                const settlementAccountId = accountResponse.data?.data.id;

                if (!settlementAccountId) {
                    throw new Error("Settlement account ID is missing in the response");
                }

                const accountDetailsResponse = await AnchorApi.account.fetchDepositAccountNumber(settlementAccountId);

                if (accountDetailsResponse.data?.data.errors &&
                    accountDetailsResponse.data?.data.errors.length > 0) {
                    throw new Error(accountDetailsResponse.data.errors || "Failed to fetch account details");
                }

                const accountDetails = accountDetailsResponse.data?.included[0];

                if (!accountDetails) {
                    throw new Error("Account details are missing in the response");
                }

                const newAccountPayload: AccountType = {
                    user_id: data.userId,
                    account_name: accountDetails.attributes.accountName,
                    account_number: accountDetails.attributes.accountNumber,
                    bank_code: accountDetails.attributes.bank.nipCode,
                    bank_name: accountDetails.attributes.bank.name,
                    alias: "Main Account",
                    provider_account_id: settlementAccountId,
                    account_provider: ThirdPartyProviders.ANCHOR,
                };

                await tx.insert(accounts).values(newAccountPayload);
                await tx.update(setup).set({ is_account_created: true }).where(eq(setup.user_id, data.userId));

            });

            systemLogger.info(`Job ${job.id} completed successfully.`);
        } catch (error) {
            if (error instanceof Error && 'response' in error) {
                console.log((error as any)?.response?.data?.errors?.[0], "this na me dey log this error");
            } else {
                console.log(error, "this na me dey log this error");
            }
            systemLogger.error(`Job ${job.id} failed: ${error}`);
            throw error;
        }
    },
    {
        connection: connection,
        metrics: {
            maxDataPoints: MetricsTime.ONE_WEEK * 2,
        },
        removeOnComplete: {
            age: 60,
        },

        autorun: false,
    }
);

Anchor_createDepositAccountWorker.on("completed", async (job) => {
    systemLogger.info(`Job ${job.id} completed successfully.`);
});

Anchor_createDepositAccountWorker.on("failed", (job, error) => {
    systemLogger.error(`Job ${job?.id} failed: ${error?.message}`);
});

Anchor_createDepositAccountWorker.on("error", (err) => {
    systemLogger.error(`Worker error: ${err.message}`);
});

export default Anchor_createDepositAccountWorker;