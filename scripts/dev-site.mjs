import { createReadStream } from "node:fs";
import { access, readdir, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, normalize, resolve, sep } from "node:path";
import { buildSiteFooterHtml, injectSiteFooter, loadSiteEnv } from "./site-footer.mjs";

const repoRoot = resolve(".");
const appsRoot = resolve(repoRoot, "apps");
const port = Number(process.env.PORT || 5173);

async function discoverRoutes() {
  const entries = await readdir(appsRoot, { withFileTypes: true });
  const appRoutes = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const appRoot = resolve(appsRoot, entry.name);
    if (!(await fileExists(resolve(appRoot, "index.html")))) {
      continue;
    }

    appRoutes.push({
      prefix: entry.name === "tool-hub" ? "" : `/${entry.name}`,
      root: appRoot,
      name: entry.name,
    });
  }

  return appRoutes.sort((a, b) => {
    if (a.prefix === "") return 1;
    if (b.prefix === "") return -1;
    return b.prefix.length - a.prefix.length;
  });
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".otf": "font/otf",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

function matchRoute(routes, pathname) {
  return routes.find((route) => (
    route.prefix
      ? pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)
      : true
  ));
}

function resolveRequestPath(url) {
  const { pathname } = new URL(url, `http://127.0.0.1:${port}`);
  const route = matchRoute(routes, pathname);
  if (!route) {
    return null;
  }

  const relativePath = route.prefix
    ? pathname.slice(route.prefix.length).replace(/^\/+/, "")
    : pathname.replace(/^\/+/, "");
  const mappedPath = relativePath || "index.html";
  const absolutePath = resolve(route.root, normalize(decodeURIComponent(mappedPath)));
  if (!absolutePath.startsWith(route.root + sep) && absolutePath !== route.root) {
    return null;
  }
  return { filePath: absolutePath, appRoot: route.root };
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function sendHtml(response, filePath, appRoot) {
  const footerHtml = buildSiteFooterHtml(await loadSiteEnv(appRoot));
  const html = injectSiteFooter(await readFile(filePath, "utf8"), footerHtml);
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
  });
  response.end(html);
}

const routes = await discoverRoutes();

const server = createServer(async (request, response) => {
  const resolved = resolveRequestPath(request.url || "/");
  if (!resolved) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  let { filePath } = resolved;
  if (!(await fileExists(filePath))) {
    if (extname(filePath)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    filePath = resolve(resolved.appRoot, "index.html");
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    if (extname(filePath).toLowerCase() === ".html") {
      await sendHtml(response, filePath, resolved.appRoot);
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Tools site ready at http://127.0.0.1:${port}`);
  console.log(`Mapped apps: ${routes.map((route) => route.prefix || "/").join(", ")}`);
});
