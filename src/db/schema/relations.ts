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

export const profilesRelations = relations(profiles, ({ many }) => ({
  goals: many(goals),
  strategies: many(strategies),
  projects: many(projects),
  tasks: many(tasks),
  linkedinPosts: many(linkedinPosts),
  linkedinPillars: many(linkedinPillars),
  linkedinStrategies: many(linkedinStrategies),
  linkedinIdeas: many(linkedinIdeas),
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
