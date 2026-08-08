import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  Compass,
  FolderKanban,
  ListChecks,
  Rss,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "LifeOS — Plan. Execute. Grow.",
  description: "Turn long-term goals into daily execution, run client work, and build your LinkedIn presence — one operating system.",
};

const features = [
  {
    icon: Target,
    name: "Goals",
    description: "Set the direction. Break multi-year ambitions into quarters you can actually act on.",
  },
  {
    icon: Compass,
    name: "Strategies",
    description: "The plan between goal and task — the bets and approaches that get you there.",
  },
  {
    icon: FolderKanban,
    name: "Projects",
    description: "Group the work. Track scope, status, and progress without losing the thread.",
  },
  {
    icon: ListChecks,
    name: "Tasks",
    description: "The daily execution layer. Today's priorities, scheduled and unscheduled, in one list.",
  },
  {
    icon: Building2,
    name: "Agency workspace",
    description: "Run client work end to end — calendar, meetings, notes, kanban, time tracking.",
  },
  {
    icon: Rss,
    name: "LinkedIn engine",
    description: "Plan, write, and track content — pillars, pipeline, analytics, engagement.",
  },
];

const steps = [
  {
    step: "01",
    title: "Set a goal",
    description: "Name the outcome you're actually working toward, not just the next to-do.",
  },
  {
    step: "02",
    title: "Turn it into a plan",
    description: "Strategies and projects break the goal into scoped, ownable pieces of work.",
  },
  {
    step: "03",
    title: "Execute daily",
    description: "Your dashboard surfaces today's focus so execution never gets lost in the plan.",
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <span className="font-heading text-sm font-semibold">LifeOS</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Log in
            </Button>
            <Button size="sm" render={<Link href="/signup" />}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_88%),transparent)]"
            aria-hidden
          />
          <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3" />
              Goals, execution, and client work — one place
            </Badge>

            <h1 className="mt-6 font-heading text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl sm:leading-tight">
              Plan the year.
              <br className="hidden sm:block" /> Execute the day.
            </h1>

            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              LifeOS turns long-term goals into daily execution — then gives you the same
              system to run client work and build your LinkedIn presence, without switching tools.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-10 px-5 text-sm" render={<Link href="/signup" />}>
                Get started free
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
              <Button variant="outline" size="lg" className="h-10 px-5 text-sm" render={<Link href="/login" />}>
                Log in
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything between ambition and execution
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Six modules, one operating system — each one narrows the gap between what you
              want and what you did today.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.name} className="ring-foreground/10">
                <CardHeader>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <feature.icon className="size-4.5" />
                  </div>
                  <CardTitle className="mt-3 text-base">{feature.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-t border-border/60 bg-muted/30">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                From goal to done, in three layers
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {steps.map((item) => (
                <div key={item.step} className="flex flex-col items-start">
                  <span className="font-heading text-sm font-semibold text-primary">
                    {item.step}
                  </span>
                  <h3 className="mt-3 font-heading text-base font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              "No more scattered docs, boards, and notes apps",
              "One dashboard for today's priorities across goals and clients",
              "Content and client work tracked alongside the goals they serve",
            ].map((point) => (
              <div key={point} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-foreground">{point}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center sm:py-20">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Stop planning in one app and executing in five others
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Set up your first goal in a couple minutes and see it turn into today&apos;s plan.
            </p>
            <Button size="lg" className="mt-7 h-10 px-5 text-sm" render={<Link href="/signup" />}>
              Get started free
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} LifeOS</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">Log in</Link>
            <Link href="/signup" className="hover:text-foreground">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
