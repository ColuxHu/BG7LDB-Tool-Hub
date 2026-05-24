import { readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, sep } from "node:path";
import { siteFooterPlugin } from "../../scripts/site-footer.mjs";

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
  return "encode";
}

async function syncCorporaManifest(corporaDir) {
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

  await writeFile(join(corporaDir, "manifest.json"), `${JSON.stringify({ documents }, null, 2)}\n`, "utf8");
}

function corporaManifestPlugin() {
  const corporaDir = join(process.cwd(), "public", "corpora");

  async function sync() {
    try {
      await syncCorporaManifest(corporaDir);
    } catch (error) {
      console.warn(`[corpora] ${error.message}`);
    }
  }

  return {
    name: "corpora-manifest",
    buildStart: sync,
    configureServer(server) {
      sync();
      server.watcher.add(corporaDir);
      server.watcher.on("all", (event, path) => {
        if (path.startsWith(corporaDir) && extname(path).toLowerCase() === ".txt") {
          sync();
        }
      });
    },
  };
}

export default {
  base: "./",
  publicDir: "public",
  plugins: [corporaManifestPlugin(), siteFooterPlugin()],
};
