import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next") continue;
      walk(p, files);
    } else if (/\.tsx$/.test(ent.name)) {
      files.push(p);
    }
  }
  return files;
}

function repairComments(content) {
  return content
    .replace(/; \/\//g, ";\n//")
    .replace(/\} \/\//g, "}\n//")
    .replace(/\{ \/\//g, "{\n//")
    .replace(/\) \/\//g, ")\n//")
    .replace(/, \/\//g, ",\n//")
    .replace(/ Legacy \/\//g, " Legacy —");
}

let changed = 0;
for (const file of walk(".")) {
  const orig = fs.readFileSync(file, "utf8");
  const next = repairComments(orig);
  if (next !== orig) {
    fs.writeFileSync(file, next);
    changed++;
  }
}

console.log(`Repaired ${changed} files`);
execSync('npx prettier --write "app/**/*.tsx" "components/**/*.tsx"', {
  stdio: "inherit",
});
