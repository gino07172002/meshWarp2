#!/usr/bin/env node
/**
 * Test spec runner — parses docs/superpowers/specs/test-spec-master.md and
 * emits a machine-readable JSON of test recipes. Designed to be:
 *   1. Run standalone to validate the spec file is well-formed.
 *   2. Loaded by a future browser-side runner (Playwright/Puppeteer/etc).
 *
 * Usage:
 *   node tools/test-spec-runner.js                  # prints summary
 *   node tools/test-spec-runner.js --json           # prints all recipes as JSON
 *   node tools/test-spec-runner.js --validate       # exits 1 if spec is malformed
 *   node tools/test-spec-runner.js --filter foo     # only show recipes matching id substring
 *
 * Spec format expected — see test-spec-master.md "schema" section.
 */

const fs = require("fs");
const path = require("path");

const SPEC_PATH = path.resolve(__dirname, "..", "docs", "superpowers", "specs", "test-spec-master.md");

const FIELD_KEYS = new Set([
  "summary",
  "impl",
  "ui_path",
  "prereqs",
  "steps",
  "verify",
  "cleanup",
  "manual_only",
]);

function parseSpec(rawText) {
  const lines = rawText.split(/\r?\n/);
  const recipes = [];
  let current = null;
  let currentKey = null;
  let inListBlock = false;
  let multilineBuffer = [];
  let currentSection = null;

  function flushListBlock() {
    if (currentKey && inListBlock) {
      if (current && multilineBuffer.length > 0) {
        current[currentKey] = multilineBuffer.slice();
      } else if (current && current[currentKey] === undefined) {
        current[currentKey] = [];
      }
    }
    inListBlock = false;
    multilineBuffer = [];
  }

  function commitRecipe() {
    if (current) {
      flushListBlock();
      // Default sensible types
      if (typeof current.manual_only === "string") {
        current.manual_only = current.manual_only.toLowerCase() === "true";
      }
      if (current.section == null) current.section = currentSection || "(unsectioned)";
      recipes.push(current);
    }
    current = null;
    currentKey = null;
  }

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx += 1) {
    const line = lines[lineIdx];
    const sectionMatch = line.match(/^##\s+(.+?)\s*$/);
    if (sectionMatch && !line.startsWith("###")) {
      commitRecipe();
      currentSection = sectionMatch[1].trim();
      continue;
    }
    const recipeMatch = line.match(/^###\s+([\w-]+)\s*$/);
    if (recipeMatch) {
      commitRecipe();
      current = {
        id: recipeMatch[1],
        section: currentSection || "(unsectioned)",
        line: lineIdx + 1,
      };
      continue;
    }
    if (!current) continue;

    // Top-level field: "- **field**: value"
    const fieldMatch = line.match(/^\s*-\s+\*\*(\w+)\*\*:\s*(.*)$/);
    if (fieldMatch) {
      flushListBlock();
      const key = fieldMatch[1];
      const rest = fieldMatch[2];
      if (!FIELD_KEYS.has(key)) {
        // unknown field — store but don't flag
      }
      currentKey = key;
      if (rest === "") {
        // Multiline list follows on subsequent indented lines
        inListBlock = true;
        multilineBuffer = [];
      } else {
        // single-line value
        current[key] = rest;
        currentKey = null;
        inListBlock = false;
      }
      continue;
    }

    // Inside a multiline list, items start with "  1. ..." or "  - ..."
    if (inListBlock) {
      const itemMatch = line.match(/^\s+(?:\d+\.|-)\s+(.*)$/);
      if (itemMatch) {
        multilineBuffer.push(itemMatch[1]);
        continue;
      }
      // Blank line ends a list block
      if (/^\s*$/.test(line)) {
        flushListBlock();
        currentKey = null;
        continue;
      }
      // Anything else also ends it
      flushListBlock();
      currentKey = null;
    }
  }
  commitRecipe();
  return recipes;
}

function validateRecipe(r) {
  const issues = [];
  if (!r.summary) issues.push("missing summary");
  if (!r.impl && !r.manual_only) issues.push("missing impl link (recommended)");
  // For non-manual recipes we expect at least one verify item.
  if (!r.manual_only) {
    if (!Array.isArray(r.verify) || r.verify.length === 0) {
      issues.push("missing verify list (or set manual_only:true)");
    }
  }
  return issues;
}

function main() {
  const args = process.argv.slice(2);
  const wantJson = args.includes("--json");
  const wantValidate = args.includes("--validate");
  const filterArg = args.find((a) => a.startsWith("--filter="));
  const filter = filterArg ? filterArg.split("=")[1] : null;

  if (!fs.existsSync(SPEC_PATH)) {
    console.error(`Spec file not found: ${SPEC_PATH}`);
    process.exit(2);
  }
  const raw = fs.readFileSync(SPEC_PATH, "utf8");
  let recipes = parseSpec(raw);
  if (filter) recipes = recipes.filter((r) => r.id.includes(filter));

  if (wantJson) {
    process.stdout.write(JSON.stringify(recipes, null, 2) + "\n");
    return;
  }

  let totalIssues = 0;
  const sections = new Map();
  for (const r of recipes) {
    if (!sections.has(r.section)) sections.set(r.section, []);
    sections.get(r.section).push(r);
  }

  for (const [section, list] of sections) {
    console.log(`\n[${section}]  (${list.length} recipe(s))`);
    for (const r of list) {
      const issues = validateRecipe(r);
      const tag = r.manual_only ? "MANUAL" : "AUTO  ";
      const issueTag = issues.length > 0 ? `  ⚠  ${issues.join("; ")}` : "";
      console.log(`  ${tag}  ${r.id}  — ${(r.summary || "(no summary)").slice(0, 60)}${issueTag}`);
      totalIssues += issues.length;
    }
  }
  console.log(`\nParsed ${recipes.length} recipe(s) across ${sections.size} section(s).`);
  if (totalIssues > 0) {
    console.log(`Found ${totalIssues} validation issue(s).`);
    if (wantValidate) process.exit(1);
  } else {
    console.log("All recipes validate.");
  }
}

if (require.main === module) main();

module.exports = { parseSpec, validateRecipe };
