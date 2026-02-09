import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
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
