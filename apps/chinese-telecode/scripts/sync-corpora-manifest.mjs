import { readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const corporaDir = join(process.cwd(), "public", "corpora");
const manifestPath = join(corporaDir, "manifest.json");

function displayName(fileName) {
  return basename(fileName, extname(fileName)).replace(/[_-]+/g, " ");
}

async function collectCorpusFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectCorpusFiles(entryPath)));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".txt") {
      files.push(entryPath);
    }
  }

  return files;
}

function documentMode(group) {
  const normalizedGroup = group.toLowerCase();
  if (normalizedGroup === "telecode" || normalizedGroup === "decode") {
    return "decode";
  }
  if (normalizedGroup === "chinese" || normalizedGroup === "encode") {
    return "encode";
  }
  return "encode";
}

export async function syncCorporaManifest() {
  const files = (await collectCorpusFiles(corporaDir))
    .map((filePath) => relative(corporaDir, filePath))
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  const documents = await Promise.all(
    files.map(async (relativePath) => {
      const filePath = join(corporaDir, relativePath);
      const fileStat = await stat(filePath);
      const normalizedPath = relativePath.split(sep).join("/");
      const group = dirname(normalizedPath) === "." ? "" : normalizedPath.split("/")[0];
      return {
        title: displayName(normalizedPath),
        file: normalizedPath,
        group,
        mode: documentMode(group),
        bytes: fileStat.size,
      };
    }),
  );

  await writeFile(manifestPath, `${JSON.stringify({ documents }, null, 2)}\n`, "utf8");
  return documents;
}

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";

if (import.meta.url === entrypoint) {
  syncCorporaManifest()
    .then((documents) => {
      console.log(`Synced ${documents.length} corpus documents.`);
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
