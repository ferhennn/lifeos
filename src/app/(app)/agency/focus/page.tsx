import { Timer } from "lucide-react";
import { AgencyComingSoon } from "@/features/agency/components/coming-soon";

export default function AgencyFocusPage() {
  return (
    <AgencyComingSoon
      title="Focus Mode"
      description="A distraction-free view of your current task, checklist, timer, and notes."
      icon={Timer}
      phase="Phase 2"
    />
  );
}
