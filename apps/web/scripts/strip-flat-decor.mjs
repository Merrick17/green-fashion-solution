/**
 * Strips redundant rounded-*, shadow-*, and decorative border classes
 * from custom components (never touches components/ui).
 */
import fs from "fs";
import path from "path";

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "ui" && dir.replace(/\\/g, "/").endsWith("components")) continue;
      if (["node_modules", ".next", "scripts"].includes(ent.name)) continue;
      walk(p, files);
    } else if (/\.tsx$/.test(ent.name)) {
      files.push(p);
    }
  }
  return files;
}

const replacements = [
  [/\s*rounded-(?:full|xl|2xl|3xl|lg|md|sm|xs)\b/g, ""],
  [/\s*rounded-\[var\(--radius-[^\]]+\)\]/g, ""],
  [/\s*rounded-\[min\([^\]]+\)\]/g, ""],
  [/\s*rounded-none\b/g, ""],
  [/\s*hover:shadow-(?:sm|md|lg|xl|raised|editorial)\b/g, ""],
  [/\s*shadow-(?:sm|md|lg|xl|2xl|inner|raised|editorial)\b/g, ""],
  [/\s*transition-shadow(?:\s+duration-\d+)?/g, ""],
  [/\s*hover:border-portal-border-strong/g, ""],
  [/\s*hover:border-border-strong/g, ""],
  [/\bborder border-border\b/g, ""],
  [/\bborder border-portal-border\b/g, ""],
];

function cleanTailwindClasses(text) {
  let s = text;
  for (const [re, rep] of replacements) s = s.replace(re, rep);
  return s.replace(/\s+/g, " ").trim();
}

function processFile(content) {
  return content.replace(
    /(["'`])([^"'`]*)\1/g,
    (match, quote, inner) => {
      if (!/\b(?:rounded|shadow|border border-)/.test(inner)) return match;
      const cleaned = cleanTailwindClasses(inner);
      return `${quote}${cleaned}${quote}`;
    },
  );
}

let changed = 0;
for (const file of walk(".")) {
  const orig = fs.readFileSync(file, "utf8");
  const next = processFile(orig);
  if (next !== orig) {
    fs.writeFileSync(file, next);
    changed++;
    console.log(file);
  }
}

console.log(`Changed ${changed} files`);
