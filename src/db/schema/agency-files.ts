import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { agencyFileEntityEnum } from "./enums";
import { profiles } from "./profiles";

export const agencyFiles = pgTable("agency_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  storagePath: text("storage_path").notNull(),
  fileType: text("file_type"),
  fileSizeBytes: integer("file_size_bytes"),
  entityType: agencyFileEntityEnum("entity_type"),
  entityId: uuid("entity_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencyFile = typeof agencyFiles.$inferSelect;
export type NewAgencyFile = typeof agencyFiles.$inferInsert;
