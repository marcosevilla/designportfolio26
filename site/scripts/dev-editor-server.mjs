import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");
const PORT = 3002;

function safePath(relativePath) {
  const full = resolve(SITE_ROOT, relativePath);
  if (!full.startsWith(SITE_ROOT)) {
    throw new Error("Path outside site directory");
  }
  return full;
}

async function git(...args) {
  const { stdout } = await execFileAsync("git", args, { cwd: SITE_ROOT });
  return stdout.trim();
}

/** Commits ahead of origin (0 if no upstream). */
async function aheadCount() {
  try {
    return parseInt(await git("rev-list", "--count", "@{upstream}..HEAD"), 10) || 0;
  } catch {
    return 0;
  }
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === "GET" && url.pathname === "/read") {
      const file = url.searchParams.get("file");
      if (!file) {
        res.writeHead(400);
        res.end("Missing file param");
        return;
      }
      const content = await readFile(safePath(file), "utf-8");
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(content);
      return;
    }

    if (req.method === "POST" && url.pathname === "/write") {
      const body = await collectBody(req);
      const { file, content } = JSON.parse(body);
      if (!file || content == null) {
        res.writeHead(400);
        res.end("Missing file or content");
        return;
      }
      await writeFile(safePath(file), content, "utf-8");
      // bio.md feeds lib/bio-content.ts — regenerate so the site hot-reloads
      if (file.replace(/\\/g, "/").endsWith("content/bio.md")) {
        await execFileAsync("node", ["scripts/build-bio.mjs"], { cwd: SITE_ROOT });
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    // Unpublished state for file(s): uncommitted edits + local commits not yet pushed
    if (req.method === "GET" && url.pathname === "/status") {
      const filesParam = url.searchParams.get("files") ?? url.searchParams.get("file");
      if (!filesParam) {
        res.writeHead(400);
        res.end("Missing files param");
        return;
      }
      const files = filesParam.split(",").filter(Boolean);
      files.forEach(safePath);
      const dirty = (await git("status", "--porcelain", "--", ...files)) !== "";
      const ahead = await aheadCount();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ dirty, ahead }));
      return;
    }

    // Publish: commit ONLY the given files, then push (Vercel deploys on push)
    if (req.method === "POST" && url.pathname === "/publish") {
      const body = await collectBody(req);
      const { file, files: filesInput, message } = JSON.parse(body);
      const files = Array.isArray(filesInput) ? [...filesInput] : file ? [file] : [];
      if (files.length === 0) {
        res.writeHead(400);
        res.end("Missing files");
        return;
      }
      // bio.md's generated companion always travels with it
      if (files.some((f) => f.replace(/\\/g, "/").endsWith("content/bio.md"))) {
        files.push("lib/bio-content.ts");
      }
      files.forEach(safePath);
      const dirty = (await git("status", "--porcelain", "--", ...files)) !== "";
      if (dirty) {
        await git("add", "--", ...files);
        // Pathspec scopes the commit to these files — other staged/dirty files stay untouched
        await git("commit", "-m", message || "Content: inline edit", "--", ...files);
      }
      const ahead = await aheadCount();
      if (ahead > 0) {
        await git("push");
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, committed: dirty, pushed: ahead > 0 }));
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  } catch (err) {
    res.writeHead(500);
    res.end(err.message);
  }
}).listen(PORT, () => {
  console.log(`Editor file server running on http://localhost:${PORT}`);
});
