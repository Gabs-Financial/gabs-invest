import { integer, jsonb, pgEnum, pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.model";
import { accounts } from "./account.model";
import { timestamps } from "../columnHelpers";
import { session } from "./session.model";
import { beneficiary } from "./beneficiary.model";
import { relations } from "drizzle-orm";

export const transferTypeEnum = pgEnum('transfer_type', ["debit", "credit"]);
export const transactionTypeEnum = pgEnum('transaction_type', ["NIP_Transfer", "Book_Transfer", "Investment_Transfer"]);
export const transactionStatus = pgEnum('status', ["PENDING", "FAILED", "COMPLETED"])

export const transactions = pgTable("transactions", {
    id: uuid("id").unique().primaryKey().defaultRandom().notNull(),
    user_id: uuid().notNull().references(() => user.id, { onDelete: 'cascade' }),
    account_id: uuid().notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    reference: varchar().notNull(),
    narration: varchar(),
    fee:integer(),
    transfer_type: transferTypeEnum().notNull(),
    transaction_type: transactionTypeEnum().notNull(),
    balance_before: integer(),
    balance_after: integer(),
    currency: varchar().default("NGN"),
    summary: varchar(),
    sender: jsonb(),
    recipient: jsonb().notNull(),
    meta_data: jsonb(),
    session_id: uuid().references(() => session.id),
    amount: integer().notNull(),
    payment_amount:integer(), // this is the total amount plus ee
    initiated_at: timestamp("initiated_at").defaultNow().notNull(), 
    completed_at: timestamp("completed_at"), 
    status: transactionStatus().notNull(),
    failure_reason: varchar(), 
    channel: varchar().default("mobile"), 
    external_reference: varchar(), 
    ...timestamps,
});


export const usersRelations = relations(transactions, ({ one, many }) => ({
    user: one(user, {
        fields: [transactions.user_id],
        references: [user.id]
    })

}));