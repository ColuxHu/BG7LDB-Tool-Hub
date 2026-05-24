import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const repoRoot = resolve(".");
const appsRoot = resolve(repoRoot, "apps");
const siteRoot = resolve(repoRoot, "dist", "site");

async function pathExists(path) {
  try {
    await readdir(path);
    return true;
  } catch {
    return false;
  }
}

const entries = await readdir(appsRoot, { withFileTypes: true });

await mkdir(siteRoot, { recursive: true });

for (const entry of await readdir(siteRoot, { withFileTypes: true })) {
  await rm(resolve(siteRoot, entry.name), { recursive: true, force: true });
}

for (const entry of entries) {
  if (!entry.isDirectory()) {
    continue;
  }

  const appRoot = resolve(appsRoot, entry.name);
  const appDist = resolve(appRoot, "dist");
  if (!(await pathExists(appDist))) {
    continue;
  }

  const target = entry.name === "tool-hub"
    ? siteRoot
    : resolve(siteRoot, entry.name);

  await cp(appDist, target, {
    recursive: true,
    force: true,
    errorOnExist: false,
  });
}

console.log(`Built deployable site at ${siteRoot}`);
console.log("The site root directory was preserved for Docker bind mounts.");
