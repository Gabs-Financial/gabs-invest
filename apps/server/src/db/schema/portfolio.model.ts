import { boolean, integer, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columnHelpers";
import { user } from "./user.model";

export const riskToleranceEnum = pgEnum("risk_tolerance", ['high', "moderate", "low"])
export const investmentFrequencyEnum = pgEnum("investment_frequency", ['weekly', "monthly", "quarterly", "yearly"])
export const portfolioCurrencyEnum = pgEnum('portfolio_currency', ['NGN', "US"])
export const investmentHorizonEnum = pgEnum("investment_horizon", ['short', "medium", 'long'])
export const EmploymentStatusEnum = pgEnum("employment_status", ["Employed", "Unemployed", "Self-Employed"])
export const PortfolioTypeEnum = pgEnum("portfolio_type", ["single", "multi"])


export const portfolio = pgTable("portfolio", {
    id: uuid("id").unique().primaryKey().defaultRandom().notNull(),
    user_id: uuid().notNull().references(() => user.id, { onDelete: 'cascade' }),
    risk_tolerance: riskToleranceEnum(),
    occupation: varchar(),
    investment_target: integer(),
    investment_frequency: investmentFrequencyEnum(),
    investment_horizon: investmentHorizonEnum(),
    investment_objectives: varchar().array(),
    enable_reminder: boolean().default(true),
    auto_invest: boolean().default(false),
    monthly_income: integer(),
    is_portfolio_created: boolean().default(false),
    monthly_investment_amount: integer(),
    employment_status: EmploymentStatusEnum(),
    display_currency: portfolioCurrencyEnum().default('NGN'),
    enable_multi_portfolio: boolean().default(false),
    source_of_income: varchar(),
    portfolio_type: PortfolioTypeEnum().default('single').notNull(),
    preferred_assets: varchar().array(),
    ...timestamps

})