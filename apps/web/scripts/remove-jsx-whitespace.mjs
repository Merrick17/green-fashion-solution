import fs from "fs";
import path from "path";

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!["node_modules", ".next", "scripts"].includes(ent.name)) walk(p, files);
    } else if (/\.tsx$/.test(ent.name)) {
      files.push(p);
    }
  }
  return files;
}

const whitespaceExpr = /\s*\{\s*['"]\s*['"]\s*\}\s*/g;
let changed = 0;

for (const file of walk(".")) {
  const orig = fs.readFileSync(file, "utf8");
  const next = orig.replace(whitespaceExpr, "");
  if (next !== orig) {
    fs.writeFileSync(file, next);
    changed++;
  }
}

console.log(`Removed stray whitespace expressions from ${changed} files`);
