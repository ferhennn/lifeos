import { Paperclip } from "lucide-react";
import { AgencyComingSoon } from "@/features/agency/components/coming-soon";

export default function AgencyFilesPage() {
  return (
    <AgencyComingSoon
      title="Files"
      description="Upload and attach files to projects, meetings, and tasks."
      icon={Paperclip}
      phase="Phase 3"
    />
  );
}
