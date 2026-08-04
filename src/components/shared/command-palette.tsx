"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Target, Compass, FolderKanban, ListTodo, LayoutDashboard, Plus, Briefcase, Inbox } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useUiStore } from "@/stores/ui-store";

export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette" description="Jump anywhere or create something new">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/goals")}>
            <Target /> Goals
          </CommandItem>
          <CommandItem onSelect={() => go("/strategies")}>
            <Compass /> Strategies
          </CommandItem>
          <CommandItem onSelect={() => go("/projects")}>
            <FolderKanban /> Projects
          </CommandItem>
          <CommandItem onSelect={() => go("/tasks")}>
            <ListTodo /> Tasks
          </CommandItem>
          <CommandItem onSelect={() => go("/agency")}>
            <Briefcase /> Agency Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/agency/inbox")}>
            <Inbox /> Agency Inbox
          </CommandItem>
          <CommandItem onSelect={() => go("/agency/tasks")}>
            <ListTodo /> Agency My Tasks
          </CommandItem>
          <CommandItem onSelect={() => go("/agency/kanban")}>
            <ListTodo /> Agency Kanban
          </CommandItem>
          <CommandItem onSelect={() => go("/agency/projects")}>
            <FolderKanban /> Agency Projects
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Create">
          <CommandItem onSelect={() => go("/goals?new=1")}>
            <Plus /> New Goal
            <CommandShortcut>G</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/strategies?new=1")}>
            <Plus /> New Strategy
            <CommandShortcut>S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/projects?new=1")}>
            <Plus /> New Project
            <CommandShortcut>P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/tasks?new=1")}>
            <Plus /> New Task
            <CommandShortcut>T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/agency/tasks?new=1")}>
            <Plus /> New Agency Task
          </CommandItem>
          <CommandItem onSelect={() => go("/agency/projects?new=1")}>
            <Plus /> New Agency Project
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
