// Make sure to install the 'pg' package
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import config from "../config/app.config";
import { user } from "./schema/user.model";
import { session } from "./schema/session.model";
import { accounts } from "./schema/account.model";

const pool = new Pool({
    connectionString: config.DATABASE_URL as string,
});

const db = drizzle({client: pool, schema: {user, session, accounts}});

export default db

