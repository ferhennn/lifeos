import { Settings } from "lucide-react";
import { AgencyComingSoon } from "@/features/agency/components/coming-soon";

export default function AgencySettingsPage() {
  return (
    <AgencyComingSoon
      title="Settings"
      description="Work-hour window, estimate units, and report defaults for the Agency Workspace."
      icon={Settings}
      phase="Phase 3"
    />
  );
}
