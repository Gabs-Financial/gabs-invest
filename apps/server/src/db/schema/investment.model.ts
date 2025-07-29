import { boolean, integer, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columnHelpers";


export const investmentStatusEnum = pgEnum("investment_status", ["active", "inactive", "pending", "completed"]);
export const investmentTypeEnum = pgEnum("investment_type", ["mutual_funds", "treasury_bills", "fixed_deposit", "bonds", "stocks", "alts"]);

export const investment = pgTable("investment", {
    id: uuid("id").unique().primaryKey().defaultRandom(),
    name: varchar(),
    asset_id: uuid().notNull(),
    withdrawn: boolean().notNull().default(false),
    liquidated: boolean().notNull().default(false),
    amount: integer().notNull(),
    status: investmentStatusEnum().notNull(),
    reinvest: boolean().notNull().default(false),
    maturity_date: varchar().notNull(),
    ...timestamps

})