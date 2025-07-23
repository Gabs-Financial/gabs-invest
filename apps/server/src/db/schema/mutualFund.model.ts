import { integer, jsonb, pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columnHelpers";


export const assetCategoryEnum = pgEnum("asset_category", ["mutual_funds", 'alt_investment', "money_market_fund", "treasury_bills"])
export const assetStatusENum = pgEnum("status", ['active', 'inactive'])

export const assets = pgTable("mutual_fund_asset", {
    id: uuid("id").unique().primaryKey().defaultRandom().notNull(),
    name:varchar().notNull(),
    category: assetCategoryEnum().notNull(),
    amount: integer().notNull(),
    attributes: jsonb().notNull(),
    return_type: varchar().notNull(),
    summary: text().notNull(),
    fund_composiiton: jsonb(),
    trustee:varchar(),
    custodian:varchar(),
    unit_price: integer(),
    minimum_hold_period: varchar(),
    maximum_hold_period: varchar(),
    minimum_investment: integer(),
    maximum_investment: integer(),
    management_fee: integer(),
    status: assetStatusENum(),
    ...timestamps
})