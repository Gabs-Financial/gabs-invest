import { boolean, integer, jsonb, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { user } from "./user.model";
import { timestamps } from "../columnHelpers";


export const accountTypeEnum = pgEnum('type', ["Savings", "Current"]);
export const accountStatusEnum = pgEnum('account_status', ["active", "open", "blocked", "inactive"]);


export const accounts = pgTable("accounts", {
    id: uuid("id").unique().primaryKey().defaultRandom(),
    account_type: accountTypeEnum().default('Savings').notNull(),
    user_id: uuid().notNull().references(() => user.id, { onDelete: 'cascade' }),
    account_provider: varchar().notNull(),
    provider_account_id: varchar().notNull(),
    currency: varchar().notNull().default("NGN"),
    status: accountStatusEnum().default("open"),
    balance: integer().default(0),
    ledger_balance: integer().default(0),
    hold_balance: integer().default(0),
    available_balance: integer().default(0),
    alias: varchar().notNull(),
    account_name: varchar().notNull(),
    account_number: varchar().notNull(),
    bank_name: varchar().notNull(),
    bank_code: varchar().notNull(),
    account_purpose: varchar(),
    frozen: boolean().default(false),
    meta_data: jsonb(),
    ...timestamps
})

export const accountsRelations = relations(accounts, ({ one, many }) => ({
    user: one(user, { fields: [accounts.user_id], references: [user.id] }),
    
}));


export const accountSchemaInsert = createInsertSchema(accounts)

