"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUiStore } from "@/stores/ui-store";
import { primaryNav, workspaceNav, systemNav } from "./nav-items";
import { NavList, NavGroup } from "./nav-list";

export function AppSidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      className="hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          {!collapsed && <span className="truncate text-sm font-semibold">LifeOS</span>}
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-5 pb-4">
          <NavList items={primaryNav} collapsed={collapsed} />
          <NavGroup label="Workspaces" items={workspaceNav} collapsed={collapsed} />
          <NavGroup label="System" items={systemNav} collapsed={collapsed} />
        </div>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />
      <div className={collapsed ? "flex justify-center p-2" : "flex justify-end p-2"}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>
    </motion.aside>
  );
}
