import { relations } from "drizzle-orm";
import { profiles } from "./profiles";
import { goals } from "./goals";
import { strategies } from "./strategies";
import { projects } from "./projects";
import { epics } from "./epics";
import { tasks, taskDependencies, subtasks } from "./tasks";
import { linkedinPosts } from "./linkedin-posts";
import { linkedinPillars } from "./linkedin-pillars";
import { linkedinStrategies } from "./linkedin-strategies";
import { linkedinPostPillars } from "./linkedin-post-pillars";
import { linkedinStrategyPillars } from "./linkedin-strategy-pillars";
import { linkedinPostRevisions } from "./linkedin-post-revisions";
import { linkedinIdeas } from "./linkedin-ideas";
import { agencyProjects } from "./agency-projects";
import { agencyEpics } from "./agency-epics";
import { agencyMeetings } from "./agency-meetings";
import { agencyTasks, agencyTaskDependencies, agencyTaskChecklist } from "./agency-tasks";
import { agencyTaskComments } from "./agency-task-comments";
import { agencyNotes } from "./agency-notes";
import { agencyFiles } from "./agency-files";
import { agencyTimeLogs } from "./agency-time-logs";
import { agencyFocusSessions } from "./agency-focus-sessions";
import { agencyReports } from "./agency-reports";
import { agencyKnowledge } from "./agency-knowledge";
import { agencyActivityLogs } from "./agency-activity-logs";

export const profilesRelations = relations(profiles, ({ many }) => ({
  goals: many(goals),
  strategies: many(strategies),
  projects: many(projects),
  tasks: many(tasks),
  linkedinPosts: many(linkedinPosts),
  linkedinPillars: many(linkedinPillars),
  linkedinStrategies: many(linkedinStrategies),
  linkedinIdeas: many(linkedinIdeas),
  agencyProjects: many(agencyProjects),
  agencyMeetings: many(agencyMeetings),
  agencyTasks: many(agencyTasks),
  agencyTaskComments: many(agencyTaskComments),
  agencyNotes: many(agencyNotes),
  agencyFiles: many(agencyFiles),
  agencyTimeLogs: many(agencyTimeLogs),
  agencyFocusSessions: many(agencyFocusSessions),
  agencyReports: many(agencyReports),
  agencyKnowledge: many(agencyKnowledge),
  agencyActivityLogs: many(agencyActivityLogs),
}));

export const linkedinPostsRelations = relations(linkedinPosts, ({ one, many }) => ({
  owner: one(profiles, { fields: [linkedinPosts.userId], references: [profiles.id] }),
  strategy: one(linkedinStrategies, { fields: [linkedinPosts.strategyId], references: [linkedinStrategies.id] }),
  goal: one(goals, { fields: [linkedinPosts.goalId], references: [goals.id] }),
  pillarLinks: many(linkedinPostPillars),
  revisions: many(linkedinPostRevisions),
}));

export const linkedinPillarsRelations = relations(linkedinPillars, ({ one, many }) => ({
  owner: one(profiles, { fields: [linkedinPillars.userId], references: [profiles.id] }),
  postLinks: many(linkedinPostPillars),
  strategyLinks: many(linkedinStrategyPillars),
}));

export const linkedinStrategiesRelations = relations(linkedinStrategies, ({ one, many }) => ({
  owner: one(profiles, { fields: [linkedinStrategies.userId], references: [profiles.id] }),
  posts: many(linkedinPosts),
  pillarLinks: many(linkedinStrategyPillars),
}));

export const linkedinPostPillarsRelations = relations(linkedinPostPillars, ({ one }) => ({
  post: one(linkedinPosts, { fields: [linkedinPostPillars.postId], references: [linkedinPosts.id] }),
  pillar: one(linkedinPillars, { fields: [linkedinPostPillars.pillarId], references: [linkedinPillars.id] }),
}));

export const linkedinStrategyPillarsRelations = relations(linkedinStrategyPillars, ({ one }) => ({
  strategy: one(linkedinStrategies, { fields: [linkedinStrategyPillars.strategyId], references: [linkedinStrategies.id] }),
  pillar: one(linkedinPillars, { fields: [linkedinStrategyPillars.pillarId], references: [linkedinPillars.id] }),
}));

export const linkedinPostRevisionsRelations = relations(linkedinPostRevisions, ({ one }) => ({
  post: one(linkedinPosts, { fields: [linkedinPostRevisions.postId], references: [linkedinPosts.id] }),
}));

export const linkedinIdeasRelations = relations(linkedinIdeas, ({ one }) => ({
  owner: one(profiles, { fields: [linkedinIdeas.userId], references: [profiles.id] }),
  convertedPost: one(linkedinPosts, { fields: [linkedinIdeas.convertedPostId], references: [linkedinPosts.id] }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  owner: one(profiles, { fields: [goals.userId], references: [profiles.id] }),
  strategies: many(strategies),
  tasks: many(tasks),
}));

export const strategiesRelations = relations(strategies, ({ one, many }) => ({
  goal: one(goals, { fields: [strategies.goalId], references: [goals.id] }),
  owner: one(profiles, { fields: [strategies.userId], references: [profiles.id] }),
  projects: many(projects),
  tasks: many(tasks),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  strategy: one(strategies, { fields: [projects.strategyId], references: [strategies.id] }),
  owner: one(profiles, { fields: [projects.userId], references: [profiles.id] }),
  epics: many(epics),
  tasks: many(tasks),
}));

export const epicsRelations = relations(epics, ({ one, many }) => ({
  project: one(projects, { fields: [epics.projectId], references: [projects.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  owner: one(profiles, { fields: [tasks.userId], references: [profiles.id] }),
  epic: one(epics, { fields: [tasks.epicId], references: [epics.id] }),
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  strategy: one(strategies, { fields: [tasks.strategyId], references: [strategies.id] }),
  goal: one(goals, { fields: [tasks.goalId], references: [goals.id] }),
  subtasks: many(subtasks),
  dependsOn: many(taskDependencies, { relationName: "taskDependents" }),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, { fields: [subtasks.taskId], references: [tasks.id] }),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
    relationName: "taskDependents",
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
  }),
}));

export const agencyProjectsRelations = relations(agencyProjects, ({ one, many }) => ({
  owner: one(profiles, { fields: [agencyProjects.userId], references: [profiles.id] }),
  epics: many(agencyEpics),
  tasks: many(agencyTasks),
  meetings: many(agencyMeetings),
  notes: many(agencyNotes),
}));

export const agencyEpicsRelations = relations(agencyEpics, ({ one, many }) => ({
  project: one(agencyProjects, { fields: [agencyEpics.agencyProjectId], references: [agencyProjects.id] }),
  tasks: many(agencyTasks),
}));

export const agencyMeetingsRelations = relations(agencyMeetings, ({ one, many }) => ({
  owner: one(profiles, { fields: [agencyMeetings.userId], references: [profiles.id] }),
  project: one(agencyProjects, { fields: [agencyMeetings.agencyProjectId], references: [agencyProjects.id] }),
  tasks: many(agencyTasks),
  notes: many(agencyNotes),
}));

export const agencyTasksRelations = relations(agencyTasks, ({ one, many }) => ({
  owner: one(profiles, { fields: [agencyTasks.userId], references: [profiles.id] }),
  goal: one(goals, { fields: [agencyTasks.goalId], references: [goals.id] }),
  project: one(agencyProjects, { fields: [agencyTasks.agencyProjectId], references: [agencyProjects.id] }),
  epic: one(agencyEpics, { fields: [agencyTasks.agencyEpicId], references: [agencyEpics.id] }),
  meeting: one(agencyMeetings, { fields: [agencyTasks.meetingId], references: [agencyMeetings.id] }),
  checklist: many(agencyTaskChecklist),
  comments: many(agencyTaskComments),
  timeLogs: many(agencyTimeLogs),
  dependsOn: many(agencyTaskDependencies, { relationName: "agencyTaskDependents" }),
}));

export const agencyTaskChecklistRelations = relations(agencyTaskChecklist, ({ one }) => ({
  task: one(agencyTasks, { fields: [agencyTaskChecklist.taskId], references: [agencyTasks.id] }),
}));

export const agencyTaskDependenciesRelations = relations(agencyTaskDependencies, ({ one }) => ({
  task: one(agencyTasks, {
    fields: [agencyTaskDependencies.taskId],
    references: [agencyTasks.id],
    relationName: "agencyTaskDependents",
  }),
  dependsOnTask: one(agencyTasks, {
    fields: [agencyTaskDependencies.dependsOnTaskId],
    references: [agencyTasks.id],
  }),
}));

export const agencyTaskCommentsRelations = relations(agencyTaskComments, ({ one }) => ({
  task: one(agencyTasks, { fields: [agencyTaskComments.taskId], references: [agencyTasks.id] }),
  owner: one(profiles, { fields: [agencyTaskComments.userId], references: [profiles.id] }),
}));

export const agencyNotesRelations = relations(agencyNotes, ({ one }) => ({
  owner: one(profiles, { fields: [agencyNotes.userId], references: [profiles.id] }),
  project: one(agencyProjects, { fields: [agencyNotes.agencyProjectId], references: [agencyProjects.id] }),
  task: one(agencyTasks, { fields: [agencyNotes.agencyTaskId], references: [agencyTasks.id] }),
  meeting: one(agencyMeetings, { fields: [agencyNotes.meetingId], references: [agencyMeetings.id] }),
}));

export const agencyFilesRelations = relations(agencyFiles, ({ one }) => ({
  owner: one(profiles, { fields: [agencyFiles.userId], references: [profiles.id] }),
}));

export const agencyTimeLogsRelations = relations(agencyTimeLogs, ({ one }) => ({
  owner: one(profiles, { fields: [agencyTimeLogs.userId], references: [profiles.id] }),
  task: one(agencyTasks, { fields: [agencyTimeLogs.taskId], references: [agencyTasks.id] }),
}));

export const agencyFocusSessionsRelations = relations(agencyFocusSessions, ({ one }) => ({
  owner: one(profiles, { fields: [agencyFocusSessions.userId], references: [profiles.id] }),
  task: one(agencyTasks, { fields: [agencyFocusSessions.taskId], references: [agencyTasks.id] }),
}));

export const agencyReportsRelations = relations(agencyReports, ({ one }) => ({
  owner: one(profiles, { fields: [agencyReports.userId], references: [profiles.id] }),
}));

export const agencyKnowledgeRelations = relations(agencyKnowledge, ({ one }) => ({
  owner: one(profiles, { fields: [agencyKnowledge.userId], references: [profiles.id] }),
}));

export const agencyActivityLogsRelations = relations(agencyActivityLogs, ({ one }) => ({
  owner: one(profiles, { fields: [agencyActivityLogs.userId], references: [profiles.id] }),
}));
