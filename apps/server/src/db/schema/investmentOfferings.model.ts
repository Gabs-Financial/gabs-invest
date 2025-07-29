import { boolean, pgTable, text, uuid, varchar,  } from "drizzle-orm/pg-core";
import { timestamps } from "../columnHelpers";




export const investmentOfferings = pgTable("investment_offering", {
    id: uuid("id").unique().primaryKey().defaultRandom(),
    category: varchar().notNull(),
    slug: varchar().notNull(),
    summary: text().notNull(),
    main_image: varchar().notNull(),
    available: boolean().notNull(),
    ...timestamps
})