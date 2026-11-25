#!/usr/bin/env node
/**
 * Typography policy check: `npm run lint:typography`
 *
 * Reploot uses only Montserrat for primary page titles and Inter for all
 * other user-visible text. No additional text font families may be
 * introduced in current or future features.
 *
 * Fails when a file in app/ or src/:
 *   1. sets `fontFamily` anywhere outside the typography system
 *   2. imports `Text` / `TextInput` straight from "react-native"
 *   3. uses italic text (no italic faces are loaded)
 *   4. names a Montserrat face outside the page-title roles
 * Warns (without failing) about font sizes that are not on the type scale.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["app", "src"];
const ALLOWED_FILES = new Set([
  "src/theme/fonts.ts",
  "src/theme/typography.ts",
  "src/shared/components/typography/Text.tsx",
  "src/shared/components/typography/index.ts",
]);
const TYPE_SCALE = new Set([8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48]);

const RULES = [
  {
    id: "raw-font-family",
    test: (line) => /\bfontFamily\s*[:=]/.test(line) && !/fontFamilies\.inter\[/.test(line),
    message: "Raw fontFamily. Use a typography role or set fontWeight only (the Text primitive picks the Inter face).",
  },
  {
    id: "rn-text-import",
    multiline: true,
    test: (src) => {
      const hits = [];
      const re = /import\s*\{([^}]*)\}\s*from\s*["']react-native["']/g;
      let m;
      while ((m = re.exec(src))) {
        if (m[1].split(",").some((s) => /^(Text|TextInput)(\s+as\s+\w+)?$/.test(s.trim()))) {
          hits.push(src.slice(0, m.index).split("\n").length);
        }
      }
      return hits;
    },
    message: 'Import Text/TextInput from "@/shared/components/typography", not "react-native".',
  },
  {
    id: "italic",
    test: (line) => /fontStyle\s*:\s*["']italic["']/.test(line),
    message: "Italic is not part of the type system (no italic faces are loaded).",
  },
  {
    id: "montserrat-outside-page-title",
    test: (line) => /Montserrat_\d/.test(line) || /fontFamilies\.montserrat/.test(line),
    message: "Montserrat is reserved for typography.pageTitle* roles.",
  },
];

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
};

const errors = [];
const warnings = [];

for (const dir of SCAN_DIRS) {
  for (const abs of walk(path.join(ROOT, dir))) {
    const rel = path.relative(ROOT, abs).split(path.sep).join("/");
    if (ALLOWED_FILES.has(rel)) continue;
    const src = fs.readFileSync(abs, "utf8");
    const lines = src.split(/\r?\n/);

    for (const rule of RULES) {
      if (rule.multiline) {
        for (const line of rule.test(src)) errors.push(`${rel}:${line}  [${rule.id}] ${rule.message}`);
        continue;
      }
      lines.forEach((line, i) => {
        if (/^\s*(\/\/|\*)/.test(line)) return;
        if (rule.test(line)) errors.push(`${rel}:${i + 1}  [${rule.id}] ${rule.message}`);
      });
    }

    lines.forEach((line, i) => {
      const re = /fontSize\s*:\s*(?:clampFontSize\()?\s*(\d+(?:\.\d+)?)/g;
      let m;
      while ((m = re.exec(line))) {
        const size = Number(m[1]);
        if (size <= 48 && !TYPE_SCALE.has(size)) {
          warnings.push(`${rel}:${i + 1}  fontSize ${size} is not on the type scale (${[...TYPE_SCALE].join(", ")}).`);
        }
      }
    });
  }
}

if (warnings.length) {
  console.warn(`Typography warnings (${warnings.length}):\n  ${warnings.join("\n  ")}\n`);
}
if (errors.length) {
  console.error(`Typography policy violations (${errors.length}):\n  ${errors.join("\n  ")}`);
  console.error("\nSee src/theme/typography.ts for the approved roles.");
  process.exit(1);
}
console.log("Typography policy check passed: Montserrat (page titles) + Inter (everything else) only.");
