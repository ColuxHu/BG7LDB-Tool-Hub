import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, normalize, resolve } from "node:path";

const root = resolve(".");
const distRoot = resolve(root, "dist");
const siteRoot = existsSync(distRoot) ? distRoot : root;
const publicRoot = resolve(root, "public");
const nodeModulesRoot = resolve(root, "..", "..", "node_modules");
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function resolveRequestPath(url) {
  const { pathname } = new URL(url, `http://127.0.0.1:${port}`);
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const mappedPath = cleanPath || "index.html";
  const absolutePath = resolve(siteRoot, normalize(mappedPath));
  if (!absolutePath.startsWith(siteRoot)) {
    return null;
  }
  return absolutePath;
}

function resolvePublicRequestPath(url) {
  const { pathname } = new URL(url, `http://127.0.0.1:${port}`);
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const absolutePath = resolve(publicRoot, normalize(cleanPath));
  if (!absolutePath.startsWith(publicRoot)) {
    return null;
  }
  return absolutePath;
}

function resolveNodeModulesRequestPath(url) {
  const { pathname } = new URL(url, `http://127.0.0.1:${port}`);
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (!cleanPath.startsWith("node_modules/")) {
    return null;
  }
  const modulePath = cleanPath.replace(/^node_modules\//, "");
  const absolutePath = resolve(nodeModulesRoot, normalize(modulePath));
  if (!absolutePath.startsWith(nodeModulesRoot)) {
    return null;
  }
  return absolutePath;
}

const server = createServer(async (request, response) => {
  const filePath = resolveRequestPath(request.url || "/");
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  let target = filePath;
  if (!existsSync(target)) {
    const publicPath = resolvePublicRequestPath(request.url || "/");
    if (publicPath && existsSync(publicPath)) {
      target = publicPath;
    } else {
      const nodeModulesPath = resolveNodeModulesRequestPath(request.url || "/");
      if (nodeModulesPath && existsSync(nodeModulesPath)) {
        target = nodeModulesPath;
      } else if (extname(filePath)) {
        response.writeHead(404);
        response.end("Not found");
        return;
      } else {
        target = resolve(siteRoot, "index.html");
      }
    }
  }

  try {
    const fileStat = await stat(target);
    if (!fileStat.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(target)] || "application/octet-stream",
      "Cache-Control": target.endsWith(".json") ? "public, max-age=3600" : "no-cache",
    });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Telegraph app ready at http://127.0.0.1:${port}`);
});
