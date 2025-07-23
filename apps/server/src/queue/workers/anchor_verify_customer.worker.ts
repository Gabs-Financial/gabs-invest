import { Worker, Job,  MetricsTime } from "bullmq"
import { connection, QueueRegistry } from "../queue-registry"
import { Kyc2Customer } from "../../providers/anchor/anchor.types"
import AnchorApi from "../../providers/anchor/anchor.modules"
import { systemLogger } from "../../utils/logger"
import { Anchor_createDepositAccountQueue } from "../queue-list"




const Anchor_verifyCustomerKycWorker = new Worker(QueueRegistry.create_anchor_verify_kyc, async (job: Job) => {

    const data: Pick<Kyc2Customer, "bvn" | "dateOfBirth" | "gender"> & {customerId: string, userId: string}= job.data;

    const payload  = {
        bvn: data.bvn,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
    }

    try {

        const response = await AnchorApi.customer.verifyCustomerKyc(payload, 'TIER_2', data.customerId )

        if (response?.data?.data.errors?.length) {
            throw new Error(response.data?.data.errors || "Failed to verify customer");
        }


        return {
            userId:data.userId
        }


    } catch (error) {
        if (error instanceof Error && "response" in error) {
            console.log((error as any)?.response?.data?.errors?.[0], "this na me dey log this error");
        } else {
            console.log(error, "this is from the verify kyc");
        }
        systemLogger.error(`Job ${job.name} failed: ${error}`);
        throw error;
    }


},  {
        connection: connection,
        metrics: {
            maxDataPoints: MetricsTime.ONE_WEEK * 2,
        },
        removeOnComplete: {
            age: 60,
        },

        autorun: false,
    })


Anchor_verifyCustomerKycWorker.on("completed", async (job, returnValue) => {
    console.log(returnValue, "this is the return value for the create customer account");

    await Anchor_createDepositAccountQueue.add(QueueRegistry.create_anchor_account, returnValue );
});

// Event: Job failed
Anchor_verifyCustomerKycWorker.on("failed", (job) => {
    console.log(job?.id, "this is the error error");
    systemLogger.error(`This is the job that failed ${job?.id}`);
});

// Event: Worker error
Anchor_verifyCustomerKycWorker.on("error", (err) => {
    console.log(err.message, "this is the error error");
    systemLogger.error(`This is the error message ${err.message}: and this is the error name ${err.name}`);
});



export default Anchor_verifyCustomerKycWorker