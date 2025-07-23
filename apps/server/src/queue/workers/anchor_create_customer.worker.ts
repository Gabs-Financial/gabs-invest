import { Job, MetricsTime, Worker } from "bullmq";
import { connection, QueueRegistry } from "../queue-registry";
import AnchorApi from "../../providers/anchor/anchor.modules";
import { systemLogger } from "../../utils/logger";
import db from "../../db/connectDb";
import { CustomerData } from "../../providers/anchor/anchor.types";
import { user } from "../../db/schema/user.model";
import { ProvidersType } from "../../services/user/user.types";
import { eq } from "drizzle-orm";
import { Anchor_createDepositAccountQueue, Anchor_verifyCustomerKycQueue } from "../queue-list";

const Anchor_createCustomerWorker = new Worker(
    QueueRegistry.create_anchor_customer,
    async (job: Job) => {
        const data: CustomerData<'level_2'> = job.data;

        try {
            return await db.transaction(async (tx) => {
                const customer = await tx.query.user.findFirst({ where: eq(user.id, data.userId) });

                if (!customer) {
                    throw new Error(`Customer with ID ${data.userId} not found`);
                }

                const response = await AnchorApi.customer.createCustomer(
                    { ...job.data },
                    "IndividualCustomer",
                    "level_2"
                );

                if (response?.data?.data.errors?.length) {
                    throw new Error(response.data.data.errors || "Failed to create customer");
                }

                const providerPayload: ProvidersType = {
                    ...(typeof customer.providers === "object" && customer.providers !== null
                        ? customer.providers
                        : {}),
                    anchor_provider_id: response.data?.data.id,
                };

                await tx.update(user).set({ providers: providerPayload, kyc_level: 1 });

                const returnValuePayload = {
                    bvn:data.bvn,
                    dateOfBirth: data.dateOfBirth,
                    gender: data.gender,
                    customerId:providerPayload.anchor_provider_id,
                    userId: customer.id
                }

                return returnValuePayload
            });
        } catch (error) {
            if (error instanceof Error && "response" in error) {
                console.log((error as any)?.response?.data?.errors?.[0], "this na me dey log this error");
                throw error
            } else {
                console.log(error, "this na me dey log this error");
                systemLogger.error(`Job ${job.id} failed: ${error}`);
                throw error;
            }
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

Anchor_createCustomerWorker.on("completed", async (job, returnValue) => {
    console.log(returnValue, "this is the return value for the create customer account");

    await Anchor_verifyCustomerKycQueue.add(QueueRegistry.create_anchor_verify_kyc, returnValue, );
});

// Event: Job failed
Anchor_createCustomerWorker.on("failed", (job) => {
    console.log(job?.id, "this is the error error");
    systemLogger.error(`This is the job that failed ${job?.id}`);
});

// Event: Worker error
Anchor_createCustomerWorker.on("error", (err) => {
    console.log(err.message, "this is the error error");
    systemLogger.error(`This is the error message ${err.message}: and this is the error name ${err.name}`);
});

export default Anchor_createCustomerWorker;