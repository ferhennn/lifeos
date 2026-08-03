import { addDays, format, isAfter, startOfDay } from "date-fns";
import type { RecurrenceConfig } from "@/db/schema";

function occursOn(config: RecurrenceConfig, date: Date): boolean {
  switch (config.type) {
    case "none":
      return false;
    case "daily":
      return true;
    case "weekly":
      return config.daysOfWeek.includes(date.getDay());
    case "monthly":
      return date.getDate() === config.dayOfMonth;
    case "custom":
      return config.dates.includes(format(date, "yyyy-MM-dd"));
  }
}

/** Inclusive list of ISO date strings (yyyy-MM-dd) on which `config` fires within [from, to]. */
export function computeOccurrences(config: RecurrenceConfig, from: Date, to: Date): string[] {
  const dates: string[] = [];
  let cursor = startOfDay(from);
  const end = startOfDay(to);

  // Hard safety cap — recurrence windows in this app are always <= ~14 days,
  // this just guards against a future caller passing an unbounded range.
  let guard = 0;
  while (!isAfter(cursor, end) && guard < 366) {
    if (occursOn(config, cursor)) dates.push(format(cursor, "yyyy-MM-dd"));
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return dates;
}

export const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
