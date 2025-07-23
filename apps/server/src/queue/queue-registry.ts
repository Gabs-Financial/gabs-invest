import Redis from "ioredis";
import config from "../config/app.config";

export enum QueueRegistry {
    create_anchor_customer = "create_anchor_customer",
    create_anchor_account = "create_anchor_account",
    create_anchor_verify_kyc = "create_anchor_verify_kyc",
    create_monnify_account = "create_monnify_account"
}


export const connection = new Redis(config.REDIS_URL, {maxRetriesPerRequest: null})