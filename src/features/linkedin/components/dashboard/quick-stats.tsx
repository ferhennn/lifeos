import { Flame, Send, Users, Handshake } from "lucide-react";
import { StatCard } from "./stat-card";
import type { LinkedinDashboardData } from "../../actions/dashboard.actions";

export function QuickStats({ data }: { data: LinkedinDashboardData }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard icon={Flame} label="Posting Streak" value={`${data.streak}d`} />
      <StatCard icon={Send} label="Posts This Month" value={data.postsThisMonth} />
      <StatCard icon={Users} label="Followers" value={data.followers ?? "No data yet"} />
      <StatCard icon={Handshake} label="Inbound Leads" value={data.leadsGoal?.current ?? "No data yet"} />
    </div>
  );
}
