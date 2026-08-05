// Central color/label registry for every enum in the app. One source of
// truth so badges, kanban columns, and selects never drift out of sync.

export const dot = {
  neutral: "bg-muted-foreground/40",
  blue: "bg-primary",
  amber: "bg-amber-500",
  red: "bg-red-500",
  green: "bg-emerald-500",
} as const;

export type DotColor = keyof typeof dot;

export const priorityConfig: Record<"low" | "medium" | "high" | "urgent" | "critical", { label: string; color: DotColor }> = {
  low: { label: "Low", color: "neutral" },
  medium: { label: "Medium", color: "blue" },
  high: { label: "High", color: "amber" },
  urgent: { label: "Urgent", color: "red" },
  critical: { label: "Critical", color: "red" },
};

export const goalStatusConfig: Record<string, { label: string; color: DotColor }> = {
  active: { label: "Active", color: "blue" },
  completed: { label: "Completed", color: "green" },
  paused: { label: "Paused", color: "amber" },
  archived: { label: "Archived", color: "neutral" },
};

export const strategyStatusConfig: Record<string, { label: string; color: DotColor }> = {
  active: { label: "Active", color: "blue" },
  paused: { label: "Paused", color: "amber" },
};

export const projectStatusConfig: Record<string, { label: string; color: DotColor }> = {
  planning: { label: "Planning", color: "neutral" },
  active: { label: "Active", color: "blue" },
  on_hold: { label: "On hold", color: "amber" },
  completed: { label: "Completed", color: "green" },
  archived: { label: "Archived", color: "neutral" },
};

export const taskStatusConfig: Record<string, { label: string; color: DotColor }> = {
  backlog: { label: "Backlog", color: "neutral" },
  todo: { label: "Todo", color: "neutral" },
  in_progress: { label: "In Progress", color: "blue" },
  in_review: { label: "In Review", color: "amber" },
  done: { label: "Done", color: "green" },
  cancelled: { label: "Cancelled", color: "neutral" },
};

export const linkedinPostStatusConfig: Record<string, { label: string; color: DotColor }> = {
  idea: { label: "Idea", color: "neutral" },
  research: { label: "Research", color: "neutral" },
  draft: { label: "Draft", color: "blue" },
  review: { label: "Review", color: "amber" },
  ready: { label: "Ready", color: "amber" },
  scheduled: { label: "Scheduled", color: "blue" },
  published: { label: "Published", color: "green" },
};

export const linkedinPostPipelineStatuses = ["idea", "research", "draft", "review", "ready", "scheduled", "published"] as const;

export const linkedinIdeaStatusConfig: Record<string, { label: string; color: DotColor }> = {
  inbox: { label: "Inbox", color: "neutral" },
  expanded: { label: "Expanded", color: "blue" },
  converted: { label: "Converted", color: "green" },
  archived: { label: "Archived", color: "neutral" },
};

export const linkedinGoalMetricLabels: Record<string, string> = {
  posts_published: "Posts Published",
  followers: "Followers",
  connections: "Connections",
  inbound_leads: "Inbound Leads",
  profile_views: "Profile Views",
  comments: "Comments",
  impressions: "Impressions",
  freelance_leads: "Freelance Leads",
};

export const agencyTaskStatusConfig: Record<string, { label: string; color: DotColor }> = {
  inbox: { label: "Inbox", color: "neutral" },
  todo: { label: "Todo", color: "neutral" },
  today: { label: "Today", color: "blue" },
  in_progress: { label: "In Progress", color: "blue" },
  blocked: { label: "Blocked", color: "red" },
  waiting_review: { label: "Waiting for Review", color: "amber" },
  waiting_client: { label: "Waiting for Client", color: "amber" },
  completed: { label: "Completed", color: "green" },
  archived: { label: "Archived", color: "neutral" },
};

export const agencyTaskPriorityConfig: Record<"critical" | "high" | "medium" | "low", { label: string; color: DotColor }> = {
  critical: { label: "Critical", color: "red" },
  high: { label: "High", color: "amber" },
  medium: { label: "Medium", color: "blue" },
  low: { label: "Low", color: "neutral" },
};

export const agencyTaskTypeLabels: Record<string, string> = {
  feature: "Feature",
  bug: "Bug",
  research: "Research",
  meeting: "Meeting",
  documentation: "Documentation",
  testing: "Testing",
  deployment: "Deployment",
};

export const agencyProjectHealthConfig: Record<string, { label: string; color: DotColor }> = {
  on_track: { label: "On Track", color: "green" },
  at_risk: { label: "At Risk", color: "amber" },
  off_track: { label: "Off Track", color: "red" },
};

export const agencyInboxSourceLabels: Record<string, string> = {
  slack: "Slack Message",
  manager_request: "Manager Request",
  voice_note: "Voice Note",
  screenshot: "Screenshot",
  meeting_action_item: "Meeting Action Item",
  idea: "Idea",
  bug: "Bug",
  other: "Other",
};

export const agencyTimeLogSourceLabels: Record<string, string> = {
  timer: "Timer",
  manual: "Manual",
};

export const recurrenceLabels: Record<string, string> = {
  none: "No recurrence",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  custom: "Custom",
};
