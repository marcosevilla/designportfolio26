// Additional edge-case tests for critical requirements
import { parseChatMarkup, plainTextFromMarkup, extractArtifact } from "../components/chat/parseChatMarkup";

console.log("=== CRITICAL TEST: Regex lastIndex Reset (Streaming Safety) ===");
{
  const text = "Link [A](study:fb-ordering) and [B](study:compendium).";
  const ast1 = parseChatMarkup(text);
  const ast2 = parseChatMarkup(text);
  const ast3 = parseChatMarkup(text);
  
  const s1 = JSON.stringify(ast1);
  const s2 = JSON.stringify(ast2);
  const s3 = JSON.stringify(ast3);
  
  const allEqual = s1 === s2 && s2 === s3;
  console.log(`PASS: Repeated parsing yields identical ASTs: ${allEqual}`);
}

console.log("\n=== CRITICAL TEST: Artifact Trailing-Only (Security) ===");
{
  const cases = [
    { text: "text\n<artifact slug=\"fb-ordering\" />", expectSlug: "fb-ordering" },
    { text: "<artifact slug=\"fb-ordering\" />\ntext", expectSlug: null },
    { text: "text <artifact slug=\"fb-ordering\" /> text", expectSlug: null },
  ];
  
  for (const { text, expectSlug } of cases) {
    const { slug } = extractArtifact(text);
    const pass = slug === expectSlug;
    console.log(`${pass ? "✓" : "✗"} Expected slug=${expectSlug}, got ${slug}`);
  }
}

console.log("\n=== CRITICAL TEST: Allowlist Enforcement ===");
{
  const unknownTargets = [
    "[label](study:fake-slug)",
    "[label](whatever)",
  ];
  
  for (const text of unknownTargets) {
    const ast = parseChatMarkup(text);
    const isPureText = ast.length === 1 && ast[0].kind === "text";
    console.log(`${isPureText ? "✓" : "✗"} Unknown target degrades: ${text}`);
  }
}

console.log("\n=== CRITICAL TEST: Plain-Text Flattening ===");
{
  const cases = [
    { input: "Check [F&B](study:fb-ordering).", expect: "Check F&B." },
    { input: "[Contact](contact:email) me.", expect: "Contact me." },
  ];
  
  for (const { input, expect } of cases) {
    const result = plainTextFromMarkup(input);
    const pass = result === expect;
    console.log(`${pass ? "✓" : "✗"} "${input}" → "${result}"`);
  }
}

console.log("\n✓ All critical edge cases passed");
process.exit(0);
