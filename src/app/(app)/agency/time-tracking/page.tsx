import { Timer } from "lucide-react";
import { AgencyComingSoon } from "@/features/agency/components/coming-soon";

export default function AgencyTimeTrackingPage() {
  return (
    <AgencyComingSoon
      title="Time Tracking"
      description="Start, pause, resume, and stop timers on any task — daily, weekly, and project rollups."
      icon={Timer}
      phase="Phase 2"
    />
  );
}
