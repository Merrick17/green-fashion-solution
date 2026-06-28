#!/usr/bin/env node
/**
 * Pre-flight design lint — bans portal anti-patterns per docs/design-system.md
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const PORTAL_DIRS = [
  "app/customer",
  "app/designer",
  "app/admin",
  "components/customer",
  "components/designer",
  "components/admin",
  "components/shared",
  "components/proposals",
  "components/calendar",
];

const BANNED_PATTERNS = [
  { re: /backdrop-blur/, name: "backdrop-blur" },
  { re: /bg-gradient-/, name: "bg-gradient-*" },
  { re: /\b(?:bg|text|border)-(?:red|blue|gray)-\d{2,3}\b/, name: "hardcoded Tailwind color scale" },
];

const ALLOWED_FILES = [
  "components/moodboard/",
  "app/styles/moodboard-tldraw-overrides.css",
  "components/calendar/google-calendar.css",
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, files);
    } else if (/\.(tsx|ts|css)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function isAllowed(relPath) {
  return ALLOWED_FILES.some((a) => relPath.replace(/\\/g, "/").includes(a));
}

const violations = [];

for (const dir of PORTAL_DIRS) {
  const abs = join(ROOT, dir);
  try {
    statSync(abs);
  } catch {
    continue;
  }
  for (const file of walk(abs)) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (isAllowed(rel)) continue;
    const content = readFileSync(file, "utf8");
    for (const { re, name } of BANNED_PATTERNS) {
      if (re.test(content)) {
        violations.push({ file: rel, pattern: name });
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Design lint failed:\n");
  for (const v of violations) {
    console.error(`  ${v.file}: ${v.pattern}`);
  }
  process.exit(1);
}

console.log("Design lint passed.");
