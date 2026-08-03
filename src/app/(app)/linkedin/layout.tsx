import { LinkedinSubNav } from "@/features/linkedin/components/linkedin-sub-nav";

export default function LinkedinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <LinkedinSubNav />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
