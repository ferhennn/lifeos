import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--sidebar-primary) 0%, transparent 45%), radial-gradient(circle at 80% 70%, var(--sidebar-primary) 0%, transparent 40%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--sidebar-border) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <Link href="/" className="relative flex items-center gap-2 text-sm font-medium">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          LifeOS
        </Link>

        <div className="relative space-y-3">
          <p className="text-3xl font-semibold tracking-tight">
            Plan.
            <br />
            Execute.
            <br />
            Grow.
          </p>
          <p className="max-w-sm text-sm text-sidebar-foreground/60">
            Every task traces back to a strategy, every strategy to a goal.
            No isolated todos — just deliberate progress, every day.
          </p>
        </div>

        <p className="relative text-xs text-sidebar-foreground/40">
          &copy; {new Date().getFullYear()} LifeOS. Personal operating system.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 px-6 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1.5 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          <div className="text-center text-sm text-muted-foreground lg:text-left">{footer}</div>
        </div>
      </div>
    </div>
  );
}
