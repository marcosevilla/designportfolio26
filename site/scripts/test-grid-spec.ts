/**
 * Pure-function tests for the editorial grid column-spec parser.
 * Run with: npx tsx scripts/test-grid-spec.ts
 * Same zero-dep pattern as test-chat-parser.ts.
 */
import { parseColSpec, PRESETS } from "../lib/layout-presets";

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

console.log("parseColSpec");
assertEqual(parseColSpec("1-6"), "1 / 7", '"1-6" → "1 / 7" (END is inclusive)');
assertEqual(parseColSpec("9-12"), "9 / 13", '"9-12" → "9 / 13"');
assertEqual(parseColSpec("7-7"), "7 / 8", 'single column "7-7" → "7 / 8"');
assertEqual(parseColSpec("full"), "1 / -1", '"full" → "1 / -1"');
assertEqual(parseColSpec("3-10"), "3 / 11", '"3-10" → "3 / 11"');

console.log("parseColSpec — invalid input falls back to full");
assertEqual(parseColSpec("12-1"), "1 / -1", "reversed range falls back");
assertEqual(parseColSpec("0-6"), "1 / -1", "start below 1 falls back");
assertEqual(parseColSpec("1-13"), "1 / -1", "end above 12 falls back");
assertEqual(parseColSpec("banana"), "1 / -1", "garbage falls back");

console.log("PRESETS — shape sanity");
assertEqual(PRESETS["prose"].length, 1, "prose has one slot");
assertEqual(PRESETS["intro-rail"].length, 2, "intro-rail has two slots");
assertEqual(PRESETS["media-right"].length, 2, "media-right has two slots");
assertEqual(PRESETS["intro-rail"][0].lg, "1-7", "intro-rail main is 1-7 at lg");
assertEqual(PRESETS["intro-rail"][1].lg, "9-12", "intro-rail rail is 9-12 at lg");
for (const [name, slots] of Object.entries(PRESETS)) {
  for (const slot of slots) {
    for (const band of ["base", "md", "lg"] as const) {
      const spec = slot[band];
      if (spec !== undefined) {
        const parsed = parseColSpec(spec);
        if (parsed === "1 / -1" && spec !== "full") {
          failures++;
          console.error(`  ✗ preset "${name}" has invalid ${band} spec "${spec}"`);
        }
      }
    }
  }
}
console.log("  ✓ all preset specs parse");

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nAll grid-spec tests passed.");
