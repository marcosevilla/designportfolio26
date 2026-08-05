/**
 * Dev launcher — starts Next and the inline-editor file server together.
 *
 * `npm run dev` used to start only Next, so the editor server on :3002 had to be
 * remembered separately. Forgetting it made edit mode *look* fine and then fail at
 * save time. One command now owns both, and Ctrl+C takes both down.
 *
 * Ports: NEXT_PORT (default 3000) and EDITOR_PORT (default 3002). Override both when
 * running a second checkout/worktree alongside the primary one.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const SITE_ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

const NEXT_PORT = process.env.NEXT_PORT || "3000";
const EDITOR_PORT = process.env.EDITOR_PORT || "3002";

const children = [];
let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill(signal === "SIGINT" ? "SIGINT" : "SIGTERM");
    }
  }
}

// The editor server is quiet (one startup line), so prefix its output to keep it
// distinguishable from Next's. Next keeps a raw inherited stdio so its own
// formatting and progress rendering survive.
const editor = spawn(process.execPath, ["scripts/dev-editor-server.mjs"], {
  cwd: SITE_ROOT,
  env: { ...process.env, EDITOR_PORT },
  stdio: ["ignore", "pipe", "pipe"],
});
children.push(editor);

// Distinguishes "never came up" (usually a port clash) from "was running and died",
// so the error points at the actual problem instead of a guess.
let editorReady = false;

function prefix(stream, label) {
  let buffer = "";
  stream.setEncoding("utf-8");
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.includes("Editor file server running")) editorReady = true;
      console.log(`${label} ${line}`);
    }
  });
}
prefix(editor.stdout, "\x1b[35m[editor]\x1b[0m");
prefix(editor.stderr, "\x1b[35m[editor]\x1b[0m");

editor.on("exit", (code, signal) => {
  if (shuttingDown) return;
  // A dead editor server means saves silently stop working — don't limp along.
  console.error(
    editorReady
      ? `\x1b[35m[editor]\x1b[0m exited (${signal ?? code}) after starting — shutting down Next too.`
      : `\x1b[35m[editor]\x1b[0m failed to start on port ${EDITOR_PORT} (${signal ?? code}). Another checkout may be using it — set EDITOR_PORT to run both.`,
  );
  shutdown("SIGTERM");
});

const next = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--webpack", "--hostname", "0.0.0.0", "--port", NEXT_PORT],
  {
    cwd: SITE_ROOT,
    env: {
      ...process.env,
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --max-old-space-size=4096`.trim(),
      // Baked into the client bundle so the browser knows where the editor lives.
      NEXT_PUBLIC_EDITOR_PORT: EDITOR_PORT,
    },
    stdio: "inherit",
  },
);
children.push(next);

next.on("exit", (code, signal) => {
  shutdown("SIGTERM");
  process.exit(signal ? 1 : (code ?? 0));
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => shutdown(signal));
}
