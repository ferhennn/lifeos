import { Sparkles } from "lucide-react";

export function MotivationalQuote({ quote }: { quote: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-sm italic text-muted-foreground">&ldquo;{quote}&rdquo;</p>
    </div>
  );
}
