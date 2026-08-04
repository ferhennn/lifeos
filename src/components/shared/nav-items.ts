import {
  LayoutDashboard,
  Target,
  Compass,
  FolderKanban,
  ListTodo,
  Briefcase,
  Share2,
  Gem,
  LayoutTemplate,
  GraduationCap,
  Users,
  ScanSearch,
  Sparkles,
  ClipboardCheck,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  /** Opens the "How it works" dialog instead of navigating. */
  modal?: boolean;
};

export const primaryNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Strategies", href: "/strategies", icon: Compass },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
];

export const workspaceNav: NavItem[] = [
  { label: "Agency", href: "/agency", icon: Briefcase },
  { label: "LinkedIn", href: "/linkedin", icon: Share2 },
  { label: "Jewellery", href: "/jewellery", icon: Gem, disabled: true },
  { label: "Portfolio", href: "/portfolio", icon: LayoutTemplate, disabled: true },
  { label: "Learning Hub", href: "/learning", icon: GraduationCap, disabled: true },
  { label: "Freelance CRM", href: "/crm", icon: Users, disabled: true },
  { label: "Website Audits", href: "/audits", icon: ScanSearch, disabled: true },
];

export const systemNav: NavItem[] = [
  { label: "How it works", href: "#how-it-works", icon: HelpCircle, modal: true },
  { label: "AI Assistant", href: "/assistant", icon: Sparkles, disabled: true },
  { label: "Reviews", href: "/reviews", icon: ClipboardCheck, disabled: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3, disabled: true },
  { label: "Notifications", href: "/notifications", icon: Bell, disabled: true },
  { label: "Settings", href: "/settings", icon: Settings, disabled: true },
];
