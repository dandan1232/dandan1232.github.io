/**
 * Inject canonical + Open Graph/Twitter meta into static note pages.
 *
 * Idempotent: pages already carrying the seo-enhanced marker are skipped, so
 * this can run repeatedly (CI regenerates it over dist on every deploy).
 *
 * Usage: node scripts/enhance-notes-seo.mjs [notesDir]   (default: dist/notes)
 */
import fs from "node:fs";
import path from "node:path";

const SITE = "https://dandan1232.github.io";
const MARKER = "<!-- seo-enhanced -->";
const OG_IMAGE = `${SITE}/meta/og-image.webp`;

const notesDir = process.argv[2] ?? path.join("dist", "notes");
if (!fs.existsSync(notesDir)) {
  console.error(`[enhance-notes-seo] ${notesDir} not found`);
  process.exit(1);
}

const escapeAttr = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

let updated = 0;
let skipped = 0;

for (const entry of fs.readdirSync(notesDir)) {
  if (!entry.endsWith(".html")) continue;
  const filePath = path.join(notesDir, entry);
  let html = fs.readFileSync(filePath, "utf8");

  if (html.includes(MARKER)) {
    skipped++;
    continue;
  }

  const titleMatch = html.match(/<title>[^<]*<\/title>/i);
  // Anchor must cover the WHOLE description tag (including its self-closing
  // tail) — otherwise the leftover "/>" garbles the following head markup.
  const descMatch = html.match(/<meta\s+name="description"[^>]*>/i);
  const rawTitle = titleMatch?.[0]?.replace(/<\/?title>/gi, "").trim() ?? entry;
  const rawDesc = descMatch?.[0]?.match(/content="([^"]*)"/i)?.[1] ?? "";
  const title = escapeAttr(rawTitle);
  const description = escapeAttr(rawDesc);
  const canonical = `${SITE}/notes/${entry}`;
  const ogType = entry === "index.html" ? "website" : "article";

  // Anchor insertion right after the description meta so authoring new pages
  // keeps a single predictable head structure.
  const anchor = descMatch?.[0] ?? titleMatch?.[0];
  if (!anchor) {
    console.warn(`[enhance-notes-seo] no anchor found in ${entry}, skipped`);
    skipped++;
    continue;
  }

  const block = [
    `  ${MARKER}`,
    `  <link rel="canonical" href="${canonical}" />`,
    `  <meta property="og:title" content="${title}" />`,
    ...(rawDesc ? [`  <meta property="og:description" content="${description}" />`] : []),
    `  <meta property="og:type" content="${ogType}" />`,
    `  <meta property="og:url" content="${canonical}" />`,
    `  <meta property="og:image" content="${OG_IMAGE}" />`,
    `  <meta name="twitter:card" content="summary_large_image" />`,
  ].join("\n");

  html = html.replace(anchor, `${anchor}\n${block}`);
  fs.writeFileSync(filePath, html);
  updated++;
}

console.log(`[enhance-notes-seo] ${updated} pages updated, ${skipped} already marked or skipped`);
