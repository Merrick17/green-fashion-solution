import type { Project } from "@repo/types";

const BRIEF_FIELDS: (keyof Pick<
  Project,
  "title" | "description" | "season" | "category" | "budgetBand" | "moq" | "targetDelivery"
>)[] = [
  "title",
  "description",
  "season",
  "category",
  "budgetBand",
  "moq",
  "targetDelivery",
];

function isFieldComplete(project: Project, field: (typeof BRIEF_FIELDS)[number]): boolean {
  const value = project[field];
  if (field === "moq") return typeof value === "number" && value > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value != null;
}

export function getBriefCompleteness(project: Project): {
  percent: number;
  completed: number;
  total: number;
  missing: string[];
} {
  const missing: string[] = [];
  let completed = 0;

  for (const field of BRIEF_FIELDS) {
    if (isFieldComplete(project, field)) {
      completed += 1;
    } else {
      missing.push(field);
    }
  }

  return {
    percent: Math.round((completed / BRIEF_FIELDS.length) * 100),
    completed,
    total: BRIEF_FIELDS.length,
    missing,
  };
}

export function isBriefReadyToSubmit(project: Project): boolean {
  return getBriefCompleteness(project).percent === 100;
}
