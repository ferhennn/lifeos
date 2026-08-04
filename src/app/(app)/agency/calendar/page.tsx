import { CalendarDays } from "lucide-react";
import { AgencyComingSoon } from "@/features/agency/components/coming-soon";

export default function AgencyCalendarPage() {
  return (
    <AgencyComingSoon
      title="Calendar"
      description="Meetings, deadlines, task due dates, and focus sessions in one view."
      icon={CalendarDays}
      phase="Phase 2"
    />
  );
}
