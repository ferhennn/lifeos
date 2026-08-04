import { pgTable, uuid, text, date, jsonb, timestamp, unique } from "drizzle-orm/pg-core";
import { agencyReportTypeEnum } from "./enums";
import { profiles } from "./profiles";

export const agencyReports = pgTable(
  "agency_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    reportType: agencyReportTypeEnum("report_type").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.reportType, table.periodStart)],
);

export type AgencyReport = typeof agencyReports.$inferSelect;
export type NewAgencyReport = typeof agencyReports.$inferInsert;
