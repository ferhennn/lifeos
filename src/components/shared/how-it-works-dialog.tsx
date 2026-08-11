"use client";

import { Target, Compass, FolderKanban, ListTodo, ArrowRight, LayoutDashboard, Share2, Briefcase, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUiStore } from "@/stores/ui-store";

const chain = [
  {
    icon: Target,
    label: "Goal",
    desc: "The outcome you're after.",
    example: "e.g. \"Get 3 freelance clients\"",
  },
  {
    icon: Compass,
    label: "Strategy",
    desc: "The approach for getting there. A goal can run several at once.",
    example: "e.g. \"Cold outreach + portfolio site\"",
  },
  {
    icon: FolderKanban,
    label: "Project",
    desc: "A concrete body of work inside a strategy, with its own deadline.",
    example: "e.g. \"Redesign portfolio site\"",
  },
  {
    icon: ListTodo,
    label: "Task",
    desc: "What you actually do today — shows up on the board, list, and dashboard.",
    example: "e.g. \"Write homepage copy\"",
  },
];

const dailyFlow = [
  { label: "Quick capture", desc: "Jot anything from the dashboard the moment it crosses your mind — refine it into a real task later." },
  { label: "Check the dashboard", desc: "Today's focus task, today's LinkedIn post, and your schedule — tasks and Agency work together — all in one glance each morning." },
  { label: "Work it", desc: "Drag tasks across board columns, or check them off in list view — whichever fits the moment." },
  { label: "Progress rolls up", desc: "Finishing a task moves the ring on its project, strategy, and goal automatically — no manual bookkeeping." },
];

export function HowItWorksDialog() {
  const open = useUiStore((s) => s.howItWorksOpen);
  const setOpen = useUiStore((s) => s.setHowItWorksOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] gap-6 overflow-y-auto p-6 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>How LifeOS works</DialogTitle>
          <DialogDescription>Everything traces back to a goal, so daily work always has a reason.</DialogDescription>
        </DialogHeader>

        <div className="flex items-start justify-between gap-1">
          {chain.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1">
              <div className="flex w-16 flex-col items-center gap-1.5 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </div>
              {i < chain.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
            </div>
          ))}
        </div>

        <ul className="space-y-4 text-sm">
          {chain.map((step) => (
            <li key={step.label} className="flex gap-3">
              <step.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="space-y-0.5">
                <p>
                  <span className="font-medium">{step.label}:</span>{" "}
                  <span className="text-muted-foreground">{step.desc}</span>
                </p>
                <p className="text-xs text-muted-foreground/70">{step.example}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-lg border border-dashed border-border p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">A day in LifeOS</p>
          <ol className="space-y-3 text-sm">
            {dailyFlow.map((step, i) => (
              <li key={step.label} className="flex gap-3">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <span>
                  <span className="font-medium">{step.label}.</span>{" "}
                  <span className="text-muted-foreground">{step.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <ul className="space-y-4 text-sm">
          <li className="flex gap-3">
            <LayoutDashboard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="font-medium">Dashboard:</span>{" "}
              <span className="text-muted-foreground">
                Not a to-do list of everything — just what deserves your attention today, pulled from every goal at once.
              </span>
            </span>
          </li>
          <li className="flex gap-3">
            <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="font-medium">LinkedIn:</span>{" "}
              <span className="text-muted-foreground">
                Runs independently of the goal chain. Bulk-upload a month of posts up front; the dashboard is a daily
                operating system — today&apos;s post, an engagement checklist, weekly progress, and a rule-based coach — while
                every metric (likes, impressions, engagement rate) lives on its own Analytics page.
              </span>
            </span>
          </li>
          <li className="flex gap-3">
            <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="font-medium">Agency:</span>{" "}
              <span className="text-muted-foreground">
                A separate workspace for client work. Capture into the Inbox, triage into tasks worked from a Kanban
                board or list, grouped by project. Time Tracking (live timer or manual entry) and Focus Mode
                (distraction-free countdown) log real hours against a task — both feed the same &ldquo;Hours Worked Today&rdquo;
                stat and the task&apos;s actual time.
              </span>
            </span>
          </li>
          <li className="flex gap-3">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              <span className="font-medium">Quick capture:</span>{" "}
              <span className="text-muted-foreground">
                The input box on the dashboard. It&apos;s for speed, not structure — link it to a goal later from the task itself.
              </span>
            </span>
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
