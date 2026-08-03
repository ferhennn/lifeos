import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { db } from "./index";
import { profiles, goals, strategies, projects, epics, tasks, subtasks } from "./schema";

async function main() {
  const [profile] = await db.select().from(profiles).limit(1);

  if (!profile) {
    console.error(
      "\nNo profiles found. Sign up in the app first (pnpm dev → /signup) — a profile row is created automatically on first login. Then re-run `pnpm db:seed`.\n",
    );
    process.exit(1);
  }

  const userId = profile.id;
  console.log(`Seeding demo data for user ${userId} (${profile.fullName ?? "unnamed"})...`);

  // Wipe this user's existing data so the script is safely re-runnable.
  await db.delete(goals).where(eq(goals.userId, userId));
  await db.delete(tasks).where(eq(tasks.userId, userId));

  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const daysFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return iso(d);
  };

  // --- Goal 1: Get 3 Freelance Clients ---
  const [freelanceGoal] = await db
    .insert(goals)
    .values({
      userId,
      title: "Get 3 Freelance Clients",
      description: "Land three paying clients through outreach, portfolio, and referrals.",
      targetDate: daysFromNow(60),
      priority: "high",
      status: "active",
      coverColor: "#6366f1",
    })
    .returning();

  const [outreachStrategy] = await db
    .insert(strategies)
    .values({
      goalId: freelanceGoal.id,
      userId,
      title: "Cold Outreach",
      description: "Reach out to prospective clients daily.",
      expectedOutcome: "5 warm replies per week",
      successMetrics: "Reply rate > 10%",
      estimatedEffort: "30 min/day",
      priority: "high",
      status: "active",
      recurrenceType: "weekly",
      recurrenceConfig: { type: "weekly", daysOfWeek: [1, 3, 5] },
      taskTemplate: { title: "Send 5 cold outreach messages", priority: "high", estimatedTime: 30 },
    })
    .returning();

  await db.insert(strategies).values({
    goalId: freelanceGoal.id,
    userId,
    title: "Improve Portfolio",
    description: "Keep the portfolio sharp and conversion-focused.",
    expectedOutcome: "Higher reply-to-call rate",
    successMetrics: "3 fresh case studies",
    priority: "medium",
    status: "active",
    recurrenceType: "none",
  });

  const [portfolioProject] = await db
    .insert(projects)
    .values({
      strategyId: outreachStrategy.id,
      userId,
      title: "Landing Page Refresh",
      description: "Rebuild the freelance landing page around outcomes, not features.",
      status: "active",
      deadline: daysFromNow(21),
      links: [{ label: "Live site", url: "https://example.com" }],
    })
    .returning();

  const [heroEpic] = await db.insert(epics).values({ projectId: portfolioProject.id, title: "Hero Section", sortOrder: 0 }).returning();
  await db.insert(epics).values({ projectId: portfolioProject.id, title: "Case Studies", sortOrder: 1 });
  await db.insert(epics).values({ projectId: portfolioProject.id, title: "SEO", sortOrder: 2 });

  const [pricingTask] = await db
    .insert(tasks)
    .values({
      userId,
      title: "Design pricing section",
      description: "Three-tier pricing with a clear recommended plan.",
      status: "in_progress",
      priority: "high",
      dueDate: daysFromNow(2),
      estimatedTime: 90,
      labels: ["design"],
      epicId: heroEpic.id,
      projectId: portfolioProject.id,
      strategyId: outreachStrategy.id,
      goalId: freelanceGoal.id,
      source: "manual",
    })
    .returning();

  await db.insert(subtasks).values([
    { taskId: pricingTask.id, title: "Draft copy", isDone: true, sortOrder: 0 },
    { taskId: pricingTask.id, title: "Design in Figma", isDone: false, sortOrder: 1 },
    { taskId: pricingTask.id, title: "Get feedback", isDone: false, sortOrder: 2 },
  ]);

  await db.insert(tasks).values([
    {
      userId,
      title: "Send 5 cold outreach messages",
      status: "todo",
      priority: "high",
      dueDate: iso(today),
      estimatedTime: 30,
      strategyId: outreachStrategy.id,
      goalId: freelanceGoal.id,
      source: "strategy_generated",
    },
    {
      userId,
      title: "Follow up with last week's leads",
      status: "todo",
      priority: "medium",
      dueDate: iso(today),
      goalId: freelanceGoal.id,
      strategyId: outreachStrategy.id,
      source: "manual",
    },
  ]);

  await db.update(strategies).set({ lastGeneratedThrough: daysFromNow(13) }).where(eq(strategies.id, outreachStrategy.id));

  // --- Goal 2: Reach 10K LinkedIn Followers ---
  const [linkedinGoal] = await db
    .insert(goals)
    .values({
      userId,
      title: "Reach 10K LinkedIn Followers",
      description: "Grow an audience through consistent, valuable content.",
      targetDate: daysFromNow(180),
      priority: "medium",
      status: "active",
      coverColor: "#0ea5e9",
    })
    .returning();

  const [contentStrategy] = await db
    .insert(strategies)
    .values({
      goalId: linkedinGoal.id,
      userId,
      title: "Daily Content",
      description: "Publish one post every weekday.",
      expectedOutcome: "Steady follower growth",
      successMetrics: "+50 followers/week",
      priority: "medium",
      status: "active",
      recurrenceType: "weekly",
      recurrenceConfig: { type: "weekly", daysOfWeek: [1, 2, 3, 4, 5] },
      taskTemplate: { title: "Publish LinkedIn post", priority: "medium", estimatedTime: 20 },
    })
    .returning();

  await db.update(strategies).set({ lastGeneratedThrough: daysFromNow(13) }).where(eq(strategies.id, contentStrategy.id));

  await db.insert(tasks).values({
    userId,
    title: "Publish LinkedIn post",
    status: "todo",
    priority: "medium",
    dueDate: iso(today),
    estimatedTime: 20,
    strategyId: contentStrategy.id,
    goalId: linkedinGoal.id,
    source: "strategy_generated",
  });

  // --- Goal 3: Become AI Engineer ---
  const [learningGoal] = await db
    .insert(goals)
    .values({
      userId,
      title: "Become AI Engineer",
      description: "Build production-grade skills across the modern AI stack.",
      targetDate: daysFromNow(270),
      priority: "critical",
      status: "active",
      coverColor: "#f59e0b",
    })
    .returning();

  const [studyStrategy] = await db
    .insert(strategies)
    .values({
      goalId: learningGoal.id,
      userId,
      title: "Daily Study Block",
      description: "One focused hour on AI engineering fundamentals.",
      expectedOutcome: "Ship one small project per month",
      successMetrics: "5 study sessions/week",
      priority: "high",
      status: "active",
      recurrenceType: "daily",
      recurrenceConfig: { type: "daily" },
      taskTemplate: { title: "Study MCP / agent architecture", priority: "medium", estimatedTime: 60 },
    })
    .returning();

  await db.update(strategies).set({ lastGeneratedThrough: daysFromNow(13) }).where(eq(strategies.id, studyStrategy.id));

  await db.insert(tasks).values([
    {
      userId,
      title: "Study MCP / agent architecture",
      status: "todo",
      priority: "medium",
      dueDate: iso(today),
      estimatedTime: 60,
      strategyId: studyStrategy.id,
      goalId: learningGoal.id,
      source: "strategy_generated",
    },
    {
      userId,
      title: "Workout",
      status: "done",
      priority: "low",
      dueDate: iso(today),
      completedAt: today,
      labels: ["habit"],
      source: "manual",
    },
    {
      userId,
      title: "Read 20 pages",
      status: "todo",
      priority: "low",
      dueDate: iso(today),
      labels: ["habit"],
      source: "manual",
    },
  ]);

  // --- Goal 4: Build Portfolio (paused, for variety) ---
  await db.insert(goals).values({
    userId,
    title: "Build Portfolio",
    description: "A portfolio that gets replies, not just views.",
    targetDate: daysFromNow(45),
    priority: "medium",
    status: "paused",
    coverColor: "#8b5cf6",
  });

  // --- Goal 5: Grow Jewellery Business (completed, for variety) ---
  const [jewelleryGoal] = await db
    .insert(goals)
    .values({
      userId,
      title: "Grow Jewellery Business",
      description: "Consistent content cadence across product, story, and reviews.",
      targetDate: daysFromNow(-5),
      priority: "medium",
      status: "completed",
      coverColor: "#ec4899",
    })
    .returning();

  await db.insert(strategies).values({
    goalId: jewelleryGoal.id,
    userId,
    title: "Weekly Content Mix",
    description: "3 carousels, 2 product posts, 2 reels, daily story.",
    expectedOutcome: "Consistent engagement",
    successMetrics: "Engagement rate > 5%",
    priority: "low",
    status: "paused",
    recurrenceType: "none",
  });

  console.log("Seed complete: 5 goals, 5 strategies, 1 project, 3 epics, and a handful of tasks.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
