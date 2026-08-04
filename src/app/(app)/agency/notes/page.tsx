import { NotebookText } from "lucide-react";
import { AgencyComingSoon } from "@/features/agency/components/coming-soon";

export default function AgencyNotesPage() {
  return (
    <AgencyComingSoon
      title="Notes"
      description="Markdown notes linked to projects, tasks, and meetings."
      icon={NotebookText}
      phase="Phase 2"
    />
  );
}
