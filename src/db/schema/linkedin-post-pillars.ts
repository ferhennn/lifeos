import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { linkedinPosts } from "./linkedin-posts";
import { linkedinPillars } from "./linkedin-pillars";

export const linkedinPostPillars = pgTable(
  "linkedin_post_pillars",
  {
    postId: uuid("post_id").notNull().references(() => linkedinPosts.id, { onDelete: "cascade" }),
    pillarId: uuid("pillar_id").notNull().references(() => linkedinPillars.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.pillarId] })],
);

export type LinkedinPostPillar = typeof linkedinPostPillars.$inferSelect;
