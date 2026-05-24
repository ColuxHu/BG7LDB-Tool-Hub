import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE_FOOTER_PLACEHOLDER = "<!-- SITE_FOOTER -->";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let loadedEnv = null;

function parseDotenv(text) {
  const values = {};
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    const quote = value[0];
    if (quote === "\"" || quote === "'") {
      let quotedValue = value.slice(1);

      while (!quotedValue.endsWith(quote) && index < lines.length - 1) {
        index += 1;
        quotedValue += `\n${lines[index]}`;
      }

      value = quotedValue.endsWith(quote)
        ? quotedValue.slice(0, -1)
        : quotedValue;
    }
    values[key] = value;
  }

  return values;
}

async function readEnvFile(path) {
  try {
    return parseDotenv(await readFile(path, "utf8"));
  } catch {
    return {};
  }
}

export async function loadSiteEnv(appRoot = ".") {
  if (!loadedEnv) {
    loadedEnv = {
      ...(await readEnvFile(resolve(repoRoot, ".env"))),
      ...(await readEnvFile(resolve(repoRoot, ".env.local"))),
      ...process.env,
    };
  }

  return {
    ...loadedEnv,
    ...(await readEnvFile(resolve(appRoot, ".env"))),
    ...(await readEnvFile(resolve(appRoot, ".env.local"))),
    ...process.env,
  };
}

export function buildSiteFooterHtml(env) {
  return env.SITE_FOOTER_HTML?.trim().replaceAll("\\n", "\n") || "";
}

export function injectSiteFooter(html, footerHtml) {
  return html.replace(SITE_FOOTER_PLACEHOLDER, footerHtml);
}

export function siteFooterPlugin(appRoot = ".") {
  return {
    name: "site-footer-env",
    async transformIndexHtml(html) {
      return injectSiteFooter(html, buildSiteFooterHtml(await loadSiteEnv(appRoot)));
    },
  };
}
