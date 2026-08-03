"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarClock,
  CalendarDays,
  KanbanSquare,
  Library,
  Lightbulb,
  Compass,
  Columns3,
  HeartHandshake,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SubNavItem = { label: string; href: string; icon: LucideIcon };

const items: SubNavItem[] = [
  { label: "Dashboard", href: "/linkedin", icon: LayoutDashboard },
  { label: "Daily Posting", href: "/linkedin/daily", icon: CalendarClock },
  { label: "Calendar", href: "/linkedin/calendar", icon: CalendarDays },
  { label: "Pipeline", href: "/linkedin/pipeline", icon: KanbanSquare },
  { label: "Library", href: "/linkedin/library", icon: Library },
  { label: "Ideas Vault", href: "/linkedin/ideas", icon: Lightbulb },
  { label: "Pillars", href: "/linkedin/pillars", icon: Columns3 },
  { label: "Strategies", href: "/linkedin/strategies", icon: Compass },
  { label: "Engagement", href: "/linkedin/engagement", icon: HeartHandshake },
  { label: "Goals", href: "/linkedin/goals", icon: Target },
];

export function LinkedinSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border px-4 sm:px-6">
      {items.map((item) => {
        const isActive = item.href === "/linkedin" ? pathname === "/linkedin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-[15px] w-[15px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
