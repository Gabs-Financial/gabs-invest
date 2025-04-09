import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { user } from "./user.model";


export const tokenModel = pgTable('token', {
    id: uuid().primaryKey().defaultRandom().notNull(),
    user_id: uuid().references(() => user.id, { onDelete: "cascade" }).notNull(),
    token: varchar().unique().notNull(),
    type: varchar().notNull(),
    created_at: timestamp().defaultNow().notNull(),
    expires_at: timestamp().notNull(),
})

export const tokenSchemaInsert = createInsertSchema(tokenModel)