"use client";

import { useState } from "react";
import { ChevronsUpDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { PillarOption } from "../../actions/pillars.actions";

export function PillarMultiSelect({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: PillarOption[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.filter((o) => value.includes(o.id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button type="button" variant="outline" className="w-full justify-between font-normal" />}>
          {value.length > 0 ? `${value.length} pillar${value.length === 1 ? "" : "s"} selected` : "Select pillars"}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0">
          <Command>
            <CommandInput placeholder="Search pillars..." />
            <CommandList>
              <CommandEmpty>No pillars found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const active = value.includes(option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      onSelect={() => onChange(active ? value.filter((v) => v !== option.id) : [...value, option.id])}
                    >
                      <Check className={cn("h-4 w-4", active ? "opacity-100" : "opacity-0")} />
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: option.color }} />
                      {option.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
              <button type="button" onClick={() => onChange(value.filter((v) => v !== s.id))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
