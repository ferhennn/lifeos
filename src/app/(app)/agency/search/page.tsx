import { Search } from "lucide-react";
import { AgencyComingSoon } from "@/features/agency/components/coming-soon";

export default function AgencySearchPage() {
  return (
    <AgencyComingSoon
      title="Search"
      description="Search across tasks, projects, notes, meetings, files, and links."
      icon={Search}
      phase="Phase 3"
    />
  );
}
