"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/ui-store";
import type { NavItem } from "./nav-items";

export function NavList({
  items,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const setHowItWorksOpen = useUiStore((s) => s.setHowItWorksOpen);

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const itemClassName = cn(
          "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
          collapsed && "justify-center px-2",
          item.disabled
            ? "cursor-not-allowed text-sidebar-foreground/35"
            : isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
        );

        const content = (
          <>
            <span className="flex h-[17px] w-[17px] shrink-0 items-center justify-center">
              <Icon className="h-[17px] w-[17px]" />
            </span>
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {!collapsed && item.disabled && (
              <span className="rounded-full border border-sidebar-border px-1.5 py-0.5 text-[10px] leading-none text-sidebar-foreground/40">
                Soon
              </span>
            )}
          </>
        );

        const link = item.modal ? (
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              setHowItWorksOpen(true);
            }}
            className={itemClassName}
          >
            {content}
          </button>
        ) : (
          <Link
            href={item.disabled ? "#" : item.href}
            aria-disabled={item.disabled}
            onClick={(e) => {
              if (item.disabled) {
                e.preventDefault();
                return;
              }
              onNavigate?.();
            }}
            className={itemClassName}
          >
            {content}
          </Link>
        );

        if (collapsed) {
          return (
            <li key={item.href}>
              <Tooltip>
                <TooltipTrigger render={link} />
                <TooltipContent side="right">
                  {item.label}
                  {item.disabled ? " · Soon" : ""}
                </TooltipContent>
              </Tooltip>
            </li>
          );
        }

        return <li key={item.href}>{link}</li>;
      })}
    </ul>
  );
}

/** Groups a nav section under a label, folding not-yet-built (`disabled`) items behind a
 * collapsed-by-default toggle so a roadmap of "Soon" placeholders doesn't crowd out real nav. */
export function NavGroup({
  label,
  items,
  collapsed,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const [showSoon, setShowSoon] = useState(false);
  const active = items.filter((i) => !i.disabled);
  const soon = items.filter((i) => i.disabled);

  if (collapsed) {
    // Icon rail has no room for placeholders — only show what's usable.
    return active.length > 0 ? <NavList items={active} collapsed onNavigate={onNavigate} /> : null;
  }

  return (
    <div>
      <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/35">
        {label}
      </p>
      <NavList items={active} onNavigate={onNavigate} />
      {soon.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowSoon((v) => !v)}
            className="mt-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-sidebar-foreground/40 transition-colors hover:text-sidebar-foreground/70"
          >
            <ChevronRight className={cn("h-3 w-3 shrink-0 transition-transform", showSoon && "rotate-90")} />
            <span>{showSoon ? "Hide" : "More"} ({soon.length})</span>
          </button>
          <AnimatePresence initial={false}>
            {showSoon && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <NavList items={soon} onNavigate={onNavigate} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
