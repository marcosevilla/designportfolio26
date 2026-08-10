/**
 * Assertions for the case-study metadata row's data layer.
 * Run with: npx tsx scripts/test-study-meta.ts
 * Same zero-dep pattern as test-grid-spec.ts.
 */
import { getStudyMeta } from "../lib/content";
import { STUDY_TAGS } from "../lib/study-tags";

let failures = 0;

function assertEqual(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`  ✓ ${label}`);
  } else {
    failures++;
    console.error(`  ✗ ${label}\n      expected ${e}\n      got      ${a}`);
  }
}

console.log("getStudyMeta — reconciled values (Marco's rulings 2026-08-05)");
assertEqual(getStudyMeta("canary-food-and-beverage-ordering").year, "2025–26", "fb-ordering year is the compact en-dash range");
assertEqual(getStudyMeta("canary-food-and-beverage-ordering").role, "Lead designer", "fb-ordering role is Lead designer");
assertEqual(getStudyMeta("canary-food-and-beverage-ordering").company, "Canary Technologies", "fb-ordering company uses the full name");
assertEqual(getStudyMeta("canary-guest-hub").year, "2024–2025", "compendium year uses the en-dash range");
assertEqual(getStudyMeta("canary-guest-hub").role, "Product designer", "compendium role drops '100% design ownership'");
assertEqual(getStudyMeta("knowledge-base").year, "2024 · shipped 2026", "knowledge-base year keeps the shipped note");
assertEqual(getStudyMeta("knowledge-base").role, "Product designer", "knowledge-base role is Product designer, not Lead designer");
assertEqual(getStudyMeta("ai-workflow").year, "2025–2026", "ai-workflow year uses the en-dash range");

console.log("getStudyMeta — every tagged study resolves");
for (const slug of Object.keys(STUDY_TAGS)) {
  const meta = getStudyMeta(slug);
  const ok = Boolean(meta.company && meta.role && meta.year);
  assertEqual(ok, true, `${slug} has company, role and year`);
}

console.log("getStudyMeta — unknown slug throws");
let threw = false;
try {
  getStudyMeta("no-such-study");
} catch {
  threw = true;
}
assertEqual(threw, true, "unknown slug throws rather than returning empty strings");

console.log("STUDY_TAGS — fb-ordering gains Desktop");
assertEqual(
  STUDY_TAGS["canary-food-and-beverage-ordering"],
  ["0→1", "Mobile", "Desktop", "CMS", "Workflow"],
  "fb-ordering tags include Desktop in order"
);

console.log("STUDY_TAGS — knowledge-base tags");
assertEqual(
  STUDY_TAGS["knowledge-base"],
  ["Enterprise", "Desktop", "AI", "CMS"],
  "knowledge-base tags in order"
);

console.log(failures === 0 ? "\nAll passed." : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
