import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { buildSiteFooterHtml, injectSiteFooter, loadSiteEnv } from "./site-footer.mjs";

const appRoot = resolve(process.argv[2] || ".");
const distRoot = resolve(appRoot, "dist");
const excluded = new Set(["dist", "node_modules", ".vite"]);

async function copyEntry(name) {
  if (excluded.has(name)) {
    return;
  }
  await cp(resolve(appRoot, name), resolve(distRoot, name), {
    recursive: true,
    force: true,
    errorOnExist: false,
  });
}

await rm(distRoot, { recursive: true, force: true });
await mkdir(distRoot, { recursive: true });

for (const name of process.argv.slice(3)) {
  await copyEntry(name);
}

const indexPath = resolve(distRoot, "index.html");
const indexHtml = await readFile(indexPath, "utf8");
const footerHtml = buildSiteFooterHtml(await loadSiteEnv(appRoot));
await writeFile(indexPath, injectSiteFooter(indexHtml, footerHtml), "utf8");

console.log(`Copied ${basename(appRoot)} static app to ${distRoot}`);
