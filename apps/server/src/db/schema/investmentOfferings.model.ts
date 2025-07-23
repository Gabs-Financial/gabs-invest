import { pgTable, text, uuid, varchar,  } from "drizzle-orm/pg-core";
import { timestamps } from "../columnHelpers";




export const investmentOfferings = pgTable("investment_offering", {

    id: uuid("id").unique().primaryKey().defaultRandom(),
    label: varchar().notNull(),
    slug: varchar().notNull(),
    summary: text().notNull(),
    icon: varchar().notNull(),
    ...timestamps

})