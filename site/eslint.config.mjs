// Flat ESLint config, added 2026-08-05.
//
// The project had `eslint@9` and `eslint-config-next@16` in devDependencies
// but NO config file anywhere — so lint had never actually run, and the 11
// inline `eslint-disable` comments in the tree were suppressing rules that
// were not configured. `npm run lint` was also broken: it called `next lint`,
// which Next 16 removed, so the arg parser read "lint" as a directory name
// ("no such directory: .../site/lint"). package.json now calls eslint directly.
//
// `eslint-config-next@16` exports a real flat-config ARRAY, so it spreads in
// directly — no FlatCompat/@eslint/eslintrc shim required.
//
// SEVERITY POLICY. The first run surfaced 67 findings, none of which are
// runtime defects. Rather than mass-editing working code to satisfy a linter
// that has never run, rules are graded by what they actually catch here:
// things that would break the site stay errors, and the React Compiler's
// advisory rules are warnings recording a real backlog. Revisit deliberately
// — see F-13/F-14 in docs/audits/2026-08-05-technical-audit.md.

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
      ".sheets/**",
    ],
  },

  ...nextCoreWebVitals,

  {
    rules: {
      // ── Deliberate project decisions, not findings ────────────────────
      // 29 hits. `images.unoptimized: true` is set site-wide in
      // next.config.mjs, so next/image buys nothing but a wrapper element,
      // and the fixed-geometry product specimens explicitly do not want one
      // (rationale is documented in the specimen deviation comments and in
      // .claude/rules/specimens.md). Turning this on would be cargo-culting.
      "@next/next/no-img-element": "off",

      // ── React Compiler advisories: real backlog, not breakage ─────────
      // 20 hits, almost all the same legitimate shape — an on-mount effect
      // reading localStorage/matchMedia and calling setState once to
      // hydrate. That is the standard SSR-safe pattern and it is correct
      // here; the rule is warning about cascading renders in the general
      // case. Left visible as warnings so new instances are noticed.
      "react-hooks/set-state-in-effect": "warn",
      // 6 hits. Mutating a value the compiler considers frozen (mostly
      // canvas/animation params objects mutated in a rAF closure). Worth
      // auditing one day; none is a live bug.
      "react-hooks/immutability": "warn",
      // 2 hits, both in CaseStudyList's filter callbacks.
      "react-hooks/preserve-manual-memoization": "warn",
      // 10 known instances, most deliberate mount-once effects. Do not
      // "fix" these blind — several would change behaviour.
      "react-hooks/exhaustive-deps": "warn",

      // The site writes straight apostrophes everywhere — 462 of them,
      // zero typographic ones. Exactly 3 trip this rule, purely because
      // those happen to sit in JSX text nodes rather than string literals.
      // "Fixing" only those 3 would create inconsistency rather than
      // remove it. Moving all 462 to smart punctuation is a real
      // typography improvement, but it is a deliberate copy decision for
      // Marco, not a lint cleanup — logged in TYPOGRAPHY-BACKLOG.
      "react/no-unescaped-entities": "off",

      // ── Kept as errors: these two can genuinely misbehave ─────────────
      // Impure render / ref access during render can produce wrong output
      // rather than merely slow output, so they stay loud.
      // (Currently 1 hit each: chat/ChatPanel.tsx and the dev-only
      // app/dev/logo-lab route. Both flagged for review, neither fixed
      // in this pass.)
      "react-hooks/purity": "error",
      "react-hooks/refs": "error",
    },
  },

  {
    // This config file itself: a default-exported array is the required
    // shape, so the anonymous-default-export rule does not apply.
    files: ["eslint.config.mjs"],
    rules: { "import/no-anonymous-default-export": "off" },
  },
];

export default config;
