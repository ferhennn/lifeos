"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  ListTodo,
  KanbanSquare,
  FolderKanban,
  Clock,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SubNavItem = { label: string; href: string; icon: LucideIcon };

// Remaining Phase 2 items (Calendar, Meetings, Notes) and all Phase 3 items
// (Reports, Knowledge Base, Files, Search, Settings) stay hidden until they
// ship — their placeholder pages/routes are untouched, just not linked here.
const items: SubNavItem[] = [
  { label: "Dashboard", href: "/agency", icon: LayoutDashboard },
  { label: "Inbox", href: "/agency/inbox", icon: Inbox },
  { label: "My Tasks", href: "/agency/tasks", icon: ListTodo },
  { label: "Kanban", href: "/agency/kanban", icon: KanbanSquare },
  { label: "Projects", href: "/agency/projects", icon: FolderKanban },
  { label: "Time Tracking", href: "/agency/time-tracking", icon: Clock },
  { label: "Focus Mode", href: "/agency/focus", icon: Timer },
];

export function AgencySubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border px-4 sm:px-6">
      {items.map((item) => {
        const isActive = item.href === "/agency" ? pathname === "/agency" : pathname.startsWith(item.href);
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
