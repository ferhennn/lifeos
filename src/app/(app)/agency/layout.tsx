import { AgencySubNav } from "@/features/agency/components/agency-sub-nav";

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <AgencySubNav />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
