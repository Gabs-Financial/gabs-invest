import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { accounts } from "./account.model";
import { timestamps } from "../columnHelpers";
import { user } from "./user.model";




export const beneficiary = pgTable("beneficiary", {
    id: uuid("id").unique().primaryKey().defaultRandom(),
    account_id: uuid().references(() => accounts.id, { onDelete: 'cascade' }),
    user_id: uuid().notNull().references(() => user.id, { onDelete: 'cascade' }),
    counterparty_id: varchar().unique(),
    account_name: varchar().notNull(),
    account_number: varchar().notNull().unique(),
    bank_name: varchar().notNull(),
    bank_code: varchar().notNull(),
    ...timestamps
})


export type BeneficiaryInsertType = typeof beneficiary.$inferInsert