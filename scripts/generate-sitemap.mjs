/**
 * Generate sitemap.xml for the GitHub Pages site: the SPA home plus every
 * static note page found under <root>/notes.
 *
 * Usage: node scripts/generate-sitemap.mjs [distRoot]   (default: dist)
 */
import fs from "node:fs";
import path from "node:path";

const SITE = "https://dandan1232.github.io";

const distRoot = process.argv[2] ?? "dist";
if (!fs.existsSync(distRoot)) {
  console.error(`[generate-sitemap] ${distRoot} not found`);
  process.exit(1);
}

const notesDir = path.join(distRoot, "notes");
const noteFiles = fs.existsSync(notesDir) ? fs.readdirSync(notesDir).filter((f) => f.endsWith(".html")) : [];

const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, changefreq: "weekly", priority: "1.0" },
  ...noteFiles.map((file) => ({
    loc: `${SITE}/notes/${file}`,
    changefreq: "monthly",
    priority: file === "index.html" ? "0.8" : "0.6",
  })),
];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...urls.map(
    (url) =>
      `  <url><loc>${url.loc}</loc><lastmod>${today}</lastmod><changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`,
  ),
  `</urlset>`,
  "",
].join("\n");

fs.writeFileSync(path.join(distRoot, "sitemap.xml"), xml);
console.log(`[generate-sitemap] wrote ${urls.length} URLs to ${path.join(distRoot, "sitemap.xml")}`);
