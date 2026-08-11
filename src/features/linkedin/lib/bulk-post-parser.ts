import { linkedinPostPipelineStatuses } from "@/lib/status-config";
import type { LinkedinPostValues } from "../schema/post.schema";
import type { PillarOption } from "../actions/pillars.actions";

export const BULK_POST_TEMPLATE = `Day: 1
Status: idea
Pillar:
Topic:
Hook:
Caption:
CTA:
Hashtags:
Image Prompt:
Carousel Slide 1 Title:
Carousel Slide 1 Body:
Notes:
Reading Time:
Target Audience:
Scheduled Date:
Due Date:
----
Day: 2
Status: idea
Pillar:
Topic:
Hook:
Caption:
CTA:
Hashtags:
Image Prompt:
Notes:
Reading Time:
Target Audience:
Scheduled Date: `;

// Canonical field ids. Every recognized label writes into one of these — including
// "single line" fields like date/status/day — so a value left on the *next* line
// (instead of inline after the colon) is still captured via the same continuation
// mechanism as multi-line fields like Caption.
type FieldId =
  | "day"
  | "status"
  | "pillar"
  | "topic"
  | "hook"
  | "caption"
  | "cta"
  | "hashtags"
  | "imagePrompt"
  | "notes"
  | "readingTime"
  | "targetAudience"
  | "scheduledDate";

const LABEL_MAP: Record<string, FieldId> = {
  day: "day",
  "day number": "day",
  status: "status",
  pillar: "pillar",
  pillars: "pillar",
  "content pillar": "pillar",
  topic: "topic",
  hook: "hook",
  caption: "caption",
  cta: "cta",
  "call to action": "cta",
  hashtags: "hashtags",
  "image prompt": "imagePrompt",
  notes: "notes",
  "reading time": "readingTime",
  "estimated reading time": "readingTime",
  "target audience": "targetAudience",
  audience: "targetAudience",
  "scheduled date": "scheduledDate",
  date: "scheduledDate",
  "due date": "scheduledDate",
  due: "scheduledDate",
};

const SLIDE_LINE = /^(?:carousel\s+)?slide\s*(\d+)\s*(title|body)$/i;

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function nextWeekday(name: string): Date {
  const target = WEEKDAYS.indexOf(name);
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const diff = (target - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

const DATE_FORMATS: Array<(s: string) => Date | null> = [
  (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : null),
  (s) => {
    const lower = s.toLowerCase();
    if (lower === "today") return new Date();
    if (lower === "tomorrow") { const d = new Date(); d.setDate(d.getDate() + 1); return d; }
    if (WEEKDAYS.includes(lower)) return nextWeekday(lower);
    return null;
  },
  (s) => {
    // m/d/y or d/m/y or m-d-y — prefer month-first (US), swap when only the other order is valid.
    const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (!m) return null;
    const [, a, b, y] = m;
    let year = Number(y);
    if (year < 100) year += 2000;
    let month = Number(a);
    let day = Number(b);
    if (month > 12 && day <= 12) {
      [month, day] = [day, month];
    }
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
  },
  (s) => {
    // Strip ordinal suffixes ("10th", "3rd") which break Date parsing.
    const cleaned = s.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, "$1");
    const d = new Date(cleaned);
    if (Number.isNaN(d.getTime())) return null;
    // "Month Day" with no year parses to a bogus/ambiguous year in some engines — pin to current year
    // (or next year if that date already passed), unless a 4-digit year was actually present.
    if (!/\b\d{4}\b/.test(cleaned)) {
      const now = new Date();
      d.setFullYear(now.getFullYear());
      if (d.getTime() < now.setHours(0, 0, 0, 0)) d.setFullYear(d.getFullYear() + 1);
    }
    return d;
  },
];

function tryParseDate(raw: string): string {
  const trimmed = raw.trim().split("\n")[0]?.trim() ?? "";
  if (!trimmed) return "";
  for (const attempt of DATE_FORMATS) {
    const d = attempt(trimmed);
    if (d && !Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }
  return "";
}

function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

const MULTILINE_FIELDS = new Set<FieldId>(["topic", "hook", "caption", "cta", "hashtags", "imagePrompt", "notes", "targetAudience"]);

/** Parses one labeled-field block (see BULK_POST_TEMPLATE) into post values.
 * Recognizes a fixed set of "Label: value" lines. Any line that isn't itself a
 * recognized label is appended to whichever field is currently "open" — so a
 * value left on the line *after* its label (instead of inline) is still captured,
 * and multi-line fields like Caption/Notes work naturally. */
function parseBlock(block: string, pillarOptions: PillarOption[]): LinkedinPostValues | null {
  const lines = block.split("\n");
  const raw: Partial<Record<FieldId, string>> = {};
  const slides = new Map<number, { title: string; body: string }>();

  let currentField: FieldId | "slide" | null = null;
  let currentSlideIndex: number | null = null;
  let currentSlidePart: "title" | "body" | null = null;

  const appendToCurrent = (line: string) => {
    if (currentField === "slide" && currentSlideIndex != null && currentSlidePart) {
      const slide = slides.get(currentSlideIndex) ?? { title: "", body: "" };
      slide[currentSlidePart] = slide[currentSlidePart] ? `${slide[currentSlidePart]}\n${line}` : line;
      slides.set(currentSlideIndex, slide);
    } else if (currentField && currentField !== "slide") {
      raw[currentField] = raw[currentField] ? `${raw[currentField]}\n${line}` : line;
    }
  };

  for (const rawLine of lines) {
    const match = rawLine.match(/^([A-Za-z][A-Za-z0-9 ]*?):\s?(.*)$/);
    if (!match) {
      if (rawLine.trim() !== "") appendToCurrent(rawLine);
      continue;
    }
    const label = normalizeLabel(match[1]);
    const value = match[2] ?? "";

    const slideMatch = label.match(SLIDE_LINE);
    if (slideMatch) {
      currentField = "slide";
      currentSlideIndex = Number(slideMatch[1]);
      currentSlidePart = slideMatch[2].toLowerCase() as "title" | "body";
      const slide = slides.get(currentSlideIndex) ?? { title: "", body: "" };
      slide[currentSlidePart] = value;
      slides.set(currentSlideIndex, slide);
      continue;
    }

    const field = LABEL_MAP[label];
    if (field) {
      currentField = field;
      raw[field] = value;
      continue;
    }

    // Unrecognized "Label: value" line — treat as continuation of whatever field is open.
    appendToCurrent(rawLine);
  }

  for (const key of Object.keys(raw) as FieldId[]) {
    if (MULTILINE_FIELDS.has(key)) continue;
    // Single-line fields: if a value spilled onto a following line, keep only that.
    raw[key] = raw[key]?.split("\n").map((l) => l.trim()).filter(Boolean).pop() ?? "";
  }

  const topic = (raw.topic ?? "").trim();
  const hook = (raw.hook ?? "").trim();
  const caption = (raw.caption ?? "").trim();
  if (!topic && !hook && !caption) return null;

  const status = linkedinPostPipelineStatuses.find((s) => s.toLowerCase() === (raw.status ?? "").toLowerCase()) ?? "idea";

  const pillarNames = (raw.pillar ?? "").split(",").map((v) => v.trim()).filter(Boolean);
  const pillarIds = pillarNames
    .map((name) => pillarOptions.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id)
    .filter((id): id is string => Boolean(id));

  const readingTimeNum = parseInt(raw.readingTime ?? "", 10);

  const carouselSlides = Array.from(slides.entries())
    .sort(([a], [b]) => a - b)
    .map(([, slide]) => ({ title: slide.title.trim(), body: slide.body.trim() }))
    .filter((slide) => slide.title || slide.body)
    .map((slide, i) => ({ order: i, ...slide }));

  return {
    status,
    topic,
    hook,
    caption,
    cta: (raw.cta ?? "").trim(),
    hashtags: (raw.hashtags ?? "").trim(),
    carouselSlides,
    imagePrompt: (raw.imagePrompt ?? "").trim(),
    notes: (raw.notes ?? "").trim(),
    estimatedReadingTime: Number.isNaN(readingTimeNum) ? undefined : readingTimeNum,
    targetAudience: (raw.targetAudience ?? "").trim(),
    scheduledDate: tryParseDate(raw.scheduledDate ?? ""),
    strategyId: "",
    goalId: "",
    pillarIds,
  };
}

export function parseBulkPostsText(text: string, pillarOptions: PillarOption[]): LinkedinPostValues[] {
  const blocks = text.split(/^-{3,}$/m);
  return blocks
    .map((block) => parseBlock(block, pillarOptions))
    .filter((p): p is LinkedinPostValues => p !== null);
}
