import { Users } from "lucide-react";
import { AgencyComingSoon } from "@/features/agency/components/coming-soon";

export default function AgencyMeetingsPage() {
  return (
    <AgencyComingSoon
      title="Meetings"
      description="Store every meeting — agenda, notes, decisions, and action items."
      icon={Users}
      phase="Phase 2"
    />
  );
}
