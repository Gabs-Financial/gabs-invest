import { Queue } from 'bullmq';
import { connection, QueueRegistry } from './queue-registry';

export const Anchor_createAccountQueue = new Queue(QueueRegistry.create_anchor_customer, {
    connection: connection, defaultJobOptions: {
        removeOnComplete: 24 * 3600,
        removeOnFail: {
            age: 24 * 3600,
        },
        attempts: 0,
        backoff: {
            type: "exponential",
            delay: 50000,
        },
    },
});

export const Anchor_createDepositAccountQueue = new Queue(QueueRegistry.create_anchor_account, {
    connection: connection, defaultJobOptions: {
        removeOnComplete: 24 * 3600,
        removeOnFail: {
            age: 24 * 3600,
        },
        attempts: 0,
        backoff: {
            type: "exponential",
            delay: 50000,
        },
    },
});

export const Anchor_verifyCustomerKycQueue = new Queue(QueueRegistry.create_anchor_verify_kyc, {
    connection: connection, defaultJobOptions: {
        removeOnComplete: 24 * 3600,
        removeOnFail: {
            age: 24 * 3600,
        },
        attempts: 0,
        backoff: {
            type: "exponential",
            delay: 50000,
        },
    },
});


