import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { linkedinStrategies } from "./linkedin-strategies";
import { linkedinPillars } from "./linkedin-pillars";

export const linkedinStrategyPillars = pgTable(
  "linkedin_strategy_pillars",
  {
    strategyId: uuid("strategy_id").notNull().references(() => linkedinStrategies.id, { onDelete: "cascade" }),
    pillarId: uuid("pillar_id").notNull().references(() => linkedinPillars.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.strategyId, table.pillarId] })],
);

export type LinkedinStrategyPillar = typeof linkedinStrategyPillars.$inferSelect;
