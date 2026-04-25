// scripts/video-to-ascii.mjs
// Convert a video file into a matted ASCII JSON sequence.
// Usage:
//   node scripts/video-to-ascii.mjs \
//     --input=./source-videos/jellyfish.mp4 \
//     --out=./site/public/ascii/jellyfish-a.json \
//     --cols=80 --fps=24 --matte-threshold=32 --min-visible=40 --trim=0:3

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import Jimp from "jimp";

const DEFAULTS = {
  cols: 80,
  fps: 24,
  matteThreshold: 32,
  minVisible: 40,
  charset: " .:-=+*#%@",
  trim: "",
};

function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (const raw of argv.slice(2)) {
    const m = raw.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const val = m[2];
    if (["cols", "fps", "matteThreshold", "minVisible"].includes(key)) {
      args[key] = Number(val);
    } else {
      args[key] = val;
    }
  }
  return args;
}

function printHelp() {
  console.log(`
video-to-ascii: offline ASCII sequence generator.

Required:
  --input=<path>       Path to source .mp4
  --out=<path>         Path to output .json

Optional (defaults):
  --cols=${DEFAULTS.cols}              Target grid width in chars
  --fps=${DEFAULTS.fps}               Frames per second
  --matte-threshold=${DEFAULTS.matteThreshold}   Luminance below which pixels are matte
  --min-visible=${DEFAULTS.minVisible}       Second threshold to suppress dim ghosting
  --charset="${DEFAULTS.charset}"  Density ramp
  --trim=START:END      Trim in seconds, e.g. 0:3

Dependencies: ffmpeg on PATH; jimp in node_modules.
`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.charset.length < 2) {
    console.error("--charset must have at least 2 characters (first is matte-space, rest are the density ramp)");
    process.exit(1);
  }

  if (!args.input || !args.out) {
    printHelp();
    process.exit(1);
  }

  if (!existsSync(args.input)) {
    console.error(`Input not found: ${args.input}`);
    process.exit(1);
  }

  const tmp = join(process.cwd(), "tmp", `ascii-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });

  try {
    const ffmpegArgs = ["-y"];
    if (args.trim) {
      const [start, end] = args.trim.split(":");
      ffmpegArgs.push("-ss", start, "-to", end);
    }
    ffmpegArgs.push("-i", args.input, "-vf", `fps=${args.fps},scale=${args.cols}:-1`, `${tmp}/frame_%04d.png`);
    console.log("> ffmpeg " + ffmpegArgs.map(a => /[\s"']/.test(a) ? JSON.stringify(a) : a).join(" "));
    execFileSync("ffmpeg", ffmpegArgs, { stdio: "inherit" });

    const files = readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
    if (files.length === 0) {
      console.error("ffmpeg produced no frames");
      process.exit(1);
    }

    // Probe first frame to find rows
    const probe = await Jimp.read(join(tmp, files[0]));
    const cols = probe.bitmap.width;
    const rows = probe.bitmap.height;

    const denom = Math.max(1, args.charset.length - 1);

    const frames = [];
    for (const f of files) {
      const img = await Jimp.read(join(tmp, f));
      let out = "";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const { r, g, b } = Jimp.intToRGBA(img.getPixelColor(x, y));
          const L = 0.299 * r + 0.587 * g + 0.114 * b;
          if (L < args.matteThreshold || L < args.minVisible) {
            out += " ";
          } else {
            const t = Math.min(1, (L - args.minVisible) / (255 - args.minVisible));
            const idx = Math.max(1, Math.round(t * denom));
            out += args.charset[idx];
          }
        }
        if (y < rows - 1) out += "\n";
      }
      frames.push(out);
    }

    // Loop-seam diagnostic: mean abs diff between frame 0 and last frame.
    let diff = 0;
    const a = frames[0];
    const b = frames[frames.length - 1];
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) if (a[i] !== b[i]) diff++;
    const seamPct = ((diff / len) * 100).toFixed(1);
    console.log(`Loop-seam similarity: ${seamPct}% of cells differ between first and last frame.`);

    mkdirSync(dirname(args.out), { recursive: true });
    const json = {
      cols,
      rows,
      fps: args.fps,
      charset: args.charset,
      frames,
    };
    writeFileSync(args.out, JSON.stringify(json));
    const size = (readFileSync(args.out).length / 1024).toFixed(1);
    console.log(`Wrote ${args.out} (${size} KB, ${frames.length} frames, ${cols}×${rows}).`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
