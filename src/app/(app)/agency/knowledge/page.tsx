import { BookOpen } from "lucide-react";
import { AgencyComingSoon } from "@/features/agency/components/coming-soon";

export default function AgencyKnowledgePage() {
  return (
    <AgencyComingSoon
      title="Knowledge Base"
      description="Personal documentation — notes, snippets, commands, links, and checklists."
      icon={BookOpen}
      phase="Phase 3"
    />
  );
}
