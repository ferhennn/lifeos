"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  ListTodo,
  FolderKanban,
  Clock,
  Users,
  NotebookText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SubNavItem = { label: string; href: string; icon: LucideIcon };

const items: SubNavItem[] = [
  { label: "Dashboard", href: "/agency", icon: LayoutDashboard },
  { label: "Inbox", href: "/agency/inbox", icon: Inbox },
  { label: "My Tasks", href: "/agency/tasks", icon: ListTodo },
  { label: "Projects", href: "/agency/projects", icon: FolderKanban },
  { label: "Meetings", href: "/agency/meetings", icon: Users },
  { label: "Notes", href: "/agency/notes", icon: NotebookText },
  { label: "Time Tracking", href: "/agency/time-tracking", icon: Clock },
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
