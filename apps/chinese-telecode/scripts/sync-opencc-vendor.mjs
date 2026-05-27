import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const appRoot = resolve(".");
const repoRoot = resolve(appRoot, "../..");
const files = ["cn2t.js", "t2cn.js"];

for (const file of files) {
  const source = resolve(repoRoot, "node_modules", "opencc-js", "dist", "esm", file);
  const target = resolve(appRoot, "public", "vendor", "opencc-js", file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}

console.log(`Synced ${files.length} OpenCC vendor modules.`);
