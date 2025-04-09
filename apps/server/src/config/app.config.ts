import { getEnv } from "../utils/getEnv";

const shared_config = {
    NODE_ENV: getEnv("NODE_ENV"),
    BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
    REFRESH_TOKEN_SECRET: getEnv("JWT_REFRESH_TOKEN_SECRET"),
    ACCESS_TOKEN_SECRET: getEnv("JWT_ACCESS_TOKEN_SECRET"),
    SENDER_EMAIL: getEnv("SENDER_EMAIL"),
    PORT: getEnv("PORT"),
    ACCESS_TOKEN_EXPIRES_IN: getEnv("JWT_ACCESS_TOKEN_EXPIRES_IN"),
    REFRESH_TOKEN_EXPIRES_IN: getEnv("JWT_REFRESH_TOKEN_EXPIRES_IN"),
    SENDCHAMP_URL: getEnv("SENDCHAMP_URL"),
    SENDCHAMP_API_KEY: getEnv("SENDCHAMP_API_KEY"),
    TERMII_BASE_URL: getEnv("TERMII_BASE_URL"),
    TERMII_API_KEY: getEnv("TERMII_API_KEY"),
    ENCRYPTION_SECRET: getEnv('ENCRYPTION_SECRET')
};

const prod_config = {
    ...shared_config,
    DATABASE_URL: getEnv("PROD_DATABASE_URL"),
    DOMAIN: getEnv("PROD_DOMAIN"),
    REDIS_URL: getEnv("REDIS_URL"),
    MIXPANEL_TOKEN: getEnv("MIXPANEL_PROD_TOKEN"),
    ANCHOR_URL: getEnv("ANCHOR_PROD_URL"),
    ANCHOR_API_KEY: getEnv("ANCHOR_TEST_API_KEY"),
    MONNIFY_API_KEY: getEnv("MONNIFY_API_KEY"),
    MONNIFY_SECRET_KEY: getEnv("MONNIFY_SECRET_KEY"),
    MONNIFY_BASE_URL: getEnv("MONNIFY_PROD_BASE_URL")

};

const dev_config = {
    ...shared_config,
    DATABASE_URL: getEnv("DEV_DATABASE_URL"),
    DOMAIN: getEnv("DEV_DOMAIN", `http://localhost:4000`),
    REDIS_URL: getEnv("REDIS_URL"),
    MIXPANEL_TOKEN: getEnv("MIXPANEL_DEV_TOKEN"),
    ANCHOR_URL: getEnv("ANCHOR_SANDBOX_URL"),
    ANCHOR_API_KEY: getEnv("ANCHOR_TEST_API_KEY"),
    MONNIFY_API_KEY: getEnv("MONNIFY_API_KEY"),
    MONNIFY_SECRET_KEY: getEnv("MONNIFY_SECRET_KEY"),
    MONNIFY_BASE_URL: getEnv("MONNIFY_DEV_BASE_URL")

};

type Config = typeof shared_config & (typeof prod_config | typeof dev_config);

const createConfig = (): Config => {
    if (getEnv("NODE_ENV", "development") === "development") {
        return dev_config;
    }
    if (getEnv("NODE_ENV", "production") === "production") {
        return prod_config;
    }

    console.warn("Unexpected NODE_ENV. Using shared configuration.");
    return shared_config as Config;
};

const config = createConfig();
export default config;



