import "server-only";

import { readFileSync } from "fs";
import { join } from "path";

export type AgentSkillName = "proposal-export" | "sourcing-metadata" | "collection-strategy";

const SKILL_ROOT = join(process.cwd(), ".claude", "skills");

export function loadAgentSkill(name: AgentSkillName): string {
  try {
    const path = join(SKILL_ROOT, name, "SKILL.md");
    const raw = readFileSync(path, "utf8");
    const body = raw.replace(/^---[\s\S]*?---\s*/m, "").trim();
    return body.slice(0, 2500);
  } catch {
    return "";
  }
}

export function withSkill(system: string, skill: AgentSkillName): string {
  const excerpt = loadAgentSkill(skill);
  if (!excerpt) return system;
  return `${system}\n\n## Skill: ${skill}\n${excerpt}`;
}
