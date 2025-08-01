import { boolean, pgTable, uuid } from "drizzle-orm/pg-core";
import { user } from "./user.model";
import { relations } from "drizzle-orm";
import { timestamps } from "../columnHelpers";




export const setup = pgTable("setup", {
    id: uuid("id").unique().primaryKey().defaultRandom().notNull(),
    user_id: uuid().notNull().references(() => user.id, { onDelete: 'cascade' }),
    is_avatar_uploaded: boolean().default(false),
    is_tag_created: boolean().default(false),
    is_notification_enabled: boolean().default(false),
    is_account_funded: boolean().default(false),
    is_email_verified: boolean().default(false),
    is_email_added: boolean().default(false),
    is_phone_verified: boolean().default(false),
    is_address_verified: boolean().default(false),
    is_address_provided: boolean().default(false),
    is_identity_verified: boolean().default(false),
    is_bvn_provided: boolean().default(false),
    has_created_transactionPin: boolean().default(false),
    has_created_passcode: boolean().default(false),
    is_account_created: boolean().default(false),
    has_created_portfolio_profile:boolean().default(false),
    has_sync_contatcts:boolean().default(false),
    is_password_created: boolean().default(false),
    has_completed_onboarding: boolean().default(false),
    ...timestamps
})


export const setupRelations = relations(setup, ({ one }) => ({
    user: one(user, {
        fields: [setup.user_id],
        references: [user.id]
    })
}));