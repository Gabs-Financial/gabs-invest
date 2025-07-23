// Make sure to install the 'pg' package
import { drizzle, } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import config from "../config/app.config";
import { user , usersRelations} from "./schema/user.model";
import { session } from "./schema/session.model";
import { accounts,accountsRelations } from "./schema/account.model";
import { transactions } from "./schema/transaction.model";
import { beneficiary } from "./schema/beneficiary.model";
import { setup,setupRelations } from "./schema/setup.model";

const pool = new Pool({
    connectionString: config.DATABASE_URL as string,
});

const db = drizzle({client: pool, schema: {user, session, accounts, transactions, beneficiary,accountsRelations, usersRelations, setup, setupRelations}});

export default db

