// Ad-hoc test runner for chat parsing helpers.
// Run with: npx tsx scripts/test-chat-parser.ts
// Exits non-zero on any failure.
//
// Tests are plain assertions; no test framework needed.

import { parseChatMarkup, plainTextFromMarkup, extractArtifact } from "../components/chat/parseChatMarkup";

let passed = 0;
let failed = 0;

function expect(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}\n      expected: ${e}\n      actual:   ${a}`);
  }
}

function describe(label: string, fn: () => void) {
  console.log(label);
  fn();
}

describe("extractArtifact", () => {
  expect(
    "extracts trailing artifact marker",
    extractArtifact("Some text.\n<artifact slug=\"fb-ordering\" />"),
    { text: "Some text.", slug: "fb-ordering" }
  );
  expect(
    "tolerates trailing whitespace",
    extractArtifact("Reply.\n<artifact slug=\"upsells\" />\n   "),
    { text: "Reply.", slug: "upsells" }
  );
  expect(
    "no marker means slug=null",
    extractArtifact("Just text."),
    { text: "Just text.", slug: null }
  );
  expect(
    "rejects unknown slug (returns text untouched, slug=null)",
    extractArtifact("Reply.\n<artifact slug=\"foo-bar\" />"),
    { text: "Reply.\n<artifact slug=\"foo-bar\" />", slug: null }
  );
  expect(
    "ignores marker mid-text (must be on own trailing line)",
    extractArtifact("Mid <artifact slug=\"fb-ordering\" /> text."),
    { text: "Mid <artifact slug=\"fb-ordering\" /> text.", slug: null }
  );
});

describe("plainTextFromMarkup", () => {
  expect(
    "flattens study link to label",
    plainTextFromMarkup("I led [F&B Mobile Ordering](study:fb-ordering)."),
    "I led F&B Mobile Ordering."
  );
  expect(
    "flattens contact:email link to label",
    plainTextFromMarkup("Drop me a [line](contact:email)."),
    "Drop me a line."
  );
  expect(
    "flattens about link to label",
    plainTextFromMarkup("See my [About me](about) page."),
    "See my About me page."
  );
  expect(
    "drops trailing artifact marker",
    plainTextFromMarkup("Reply.\n<artifact slug=\"fb-ordering\" />"),
    "Reply."
  );
  expect(
    "leaves plain text untouched",
    plainTextFromMarkup("Just words."),
    "Just words."
  );
  expect(
    "leaves hallucinated study slug as plain label",
    plainTextFromMarkup("On [Foo](study:bogus-slug)."),
    "On Foo."
  );
});

describe("parseChatMarkup → AST shape", () => {
  // We test the structural shape rather than React rendering.
  const ast = parseChatMarkup("Hi [F&B](study:fb-ordering) and [me](contact:email).");
  expect("ast length", ast.length, 5);
  expect("first segment text", (ast[0] as { kind: string; text?: string }).kind, "text");
  expect("first segment text content", (ast[0] as { text: string }).text, "Hi ");
  expect("second segment is link", (ast[1] as { kind: string }).kind, "link");
  expect("second segment href", (ast[1] as { href: string }).href, "/work/fb-ordering");
  expect("second segment label", (ast[1] as { label: string }).label, "F&B");
  expect("fourth segment href is mailto", (ast[3] as { href: string }).href, "mailto:marcogsevilla@gmail.com");

  const fallback = parseChatMarkup("Plain [Foo](study:bogus).");
  expect("fallback ast length", fallback.length, 2);
  expect("fallback first segment kind", (fallback[0] as { kind: string }).kind, "text");
  expect("fallback first segment text", (fallback[0] as { text: string }).text, "Plain ");
  expect("hallucinated link degrades to text", (fallback[1] as { kind: string; text?: string }).kind, "text");
  expect("hallucinated link text content", (fallback[1] as { text: string }).text, "Foo.");
});

describe("parseChatMarkup → bold + italic emphasis", () => {
  expect(
    "bold around a phrase",
    parseChatMarkup("This is **important** stuff."),
    [
      { kind: "text", text: "This is " },
      { kind: "bold", text: "important" },
      { kind: "text", text: " stuff." },
    ]
  );
  expect(
    "italic around a word",
    parseChatMarkup("Use *this* word."),
    [
      { kind: "text", text: "Use " },
      { kind: "italic", text: "this" },
      { kind: "text", text: " word." },
    ]
  );
  expect(
    "bold and italic in the same string",
    parseChatMarkup("**Bold** and *italic*."),
    [
      { kind: "bold", text: "Bold" },
      { kind: "text", text: " and " },
      { kind: "italic", text: "italic" },
      { kind: "text", text: "." },
    ]
  );
  expect(
    "bold takes priority over italic for **word**",
    parseChatMarkup("**word**"),
    [{ kind: "bold", text: "word" }]
  );
  expect(
    "emphasis works alongside links",
    parseChatMarkup("Check **[F&B](study:fb-ordering)** for details."),
    [
      { kind: "text", text: "Check **" },
      { kind: "link", label: "F&B", href: "/work/fb-ordering", external: false, inApp: false },
      { kind: "text", text: "** for details." },
    ]
  );
  // Note: link-with-bold-around-it doesn't render bold (links are extracted
  // before emphasis), so the literal ** survives. The tail text segment is
  // merged with the preceding ** by the link-pass coalescing logic. Acceptable for v1.
});

describe("plainTextFromMarkup → bold + italic stripping", () => {
  expect(
    "strips bold wrappers",
    plainTextFromMarkup("This is **important**."),
    "This is important."
  );
  expect(
    "strips italic wrappers",
    plainTextFromMarkup("Use *this*."),
    "Use this."
  );
  expect(
    "strips both",
    plainTextFromMarkup("**Bold** and *italic*."),
    "Bold and italic."
  );
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
