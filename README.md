# BG7LDB Tools

BG7LDB web tools monorepo. This repository keeps every independently deployable web app under `apps/` and leaves the root for workspace configuration, documentation, and repository-level maintenance.

## Apps

| App | Package | Path | Type |
| --- | --- | --- | --- |
| Tool Hub | `@bg7ldb/tool-hub` | `apps/tool-hub` | Static web app |
| Luggage Tag | `@bg7ldb/luggage-tag` | `apps/luggage-tag` | Static web app |
| Table Tennis Doubles | `@bg7ldb/table-tennis-doubles` | `apps/table-tennis-doubles` | Static PWA |
| Chinese Telecode | `@bg7ldb/chinese-telecode` | `apps/chinese-telecode` | Vite app |

## Repository Layout

```text
.
|-- apps/                  # Independently runnable web apps
|   |-- tool-hub/
|   |-- luggage-tag/
|   |-- table-tennis-doubles/
|   `-- chinese-telecode/
|-- docs/                  # Repository-level documentation
|-- package.json           # npm workspace entry
|-- .gitignore
`-- README.md
```

## Local Development

Install dependencies once from the repository root:

```bash
npm install
```

Run the full local site:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

This site-level dev server supports navigation between apps and injects the optional private footer from `.env`.

Any folder under `apps/` that contains an `index.html` is mapped automatically. For example, `apps/morse-code/index.html` is available at:

```text
http://127.0.0.1:5173/morse-code/
```

Run a single app when you only need that workspace:

```bash
npm run dev:hub
npm run dev:luggage
npm run dev:table-tennis
npm run dev:telecode
```

Build all apps that expose a build script:

```bash
npm run build
```

The build output for each app is written to its own `apps/<app>/dist/` directory.

Build a deployable site tree:

```bash
npm run build:site
```

The deployable output is written to `dist/site/`. The `tool-hub` app becomes the site root, and every other app is copied to `dist/site/<app-folder>/`.

## Server Deployment

On the server, clone the repository once and configure the Nginx site root to the generated `dist/site/` directory:

```text
/path/to/BG7LDB-Tool-Hub/dist/site
```

Then update and rebuild with one command:

```bash
./scripts/deploy.sh
```

If your Nginx panel requires copying files into a separate web root, use:

```bash
./scripts/deploy.sh --copy-to /www/wwwroot/tools.bg7ldb.top
```

If you also want the script to test and reload Nginx:

```bash
./scripts/deploy.sh --reload-nginx
```

## Maintenance Workflow

### Update an Existing App

1. Edit files in the app directory:

```text
apps/<app-folder>/
```

For example:

```text
apps/chinese-telecode/
```

2. Preview the full local site:

```bash
npm run dev
```

3. Open the app path:

```text
http://127.0.0.1:5173/<app-folder>/
```

For the tool hub itself, open:

```text
http://127.0.0.1:5173/
```

4. Build the deployable site:

```bash
npm run build:site
```

5. Commit and push:

```bash
git status
git add .
git commit -m "fix: update <app-name>"
git push
```

6. Deploy on the server:

```bash
cd /opt/BG7LDB-Tool-Hub
./scripts/deploy.sh --skip-install
```

Use `./scripts/deploy.sh` without `--skip-install` when dependencies changed.

### Add a New App

1. Create a new folder under `apps/`:

```text
apps/<new-app>/
```

2. Add at least an `index.html` file:

```text
apps/<new-app>/index.html
```

3. Add optional assets next to it:

```text
apps/<new-app>/styles.css
apps/<new-app>/script.js
```

4. Add `package.json` for a simple static app:

```json
{
  "name": "@bg7ldb/<new-app>",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1 --port 5176",
    "build": "node ../../scripts/copy-static-app.mjs . index.html styles.css script.js",
    "preview": "vite preview --host 127.0.0.1 --port 4176"
  }
}
```

If the app has more static files or folders, append them to the `build` command.

5. Add a card to the tool hub:

```text
apps/tool-hub/index.html
```

Example:

```html
<a href="/morse-code/" class="tool-card">
  <h3>摩斯电码转换</h3>
  <p>支持文本与摩斯电码互转。</p>
  <span class="status online">ONLINE</span>
</a>
```

6. Preview locally:

```bash
npm run dev
```

The new app is mapped automatically:

```text
http://127.0.0.1:5173/<new-app>/
```

7. Build, commit, push, and deploy:

```bash
npm run build:site
git add .
git commit -m "feat: add <new-app>"
git push
```

On the server:

```bash
cd /opt/BG7LDB-Tool-Hub
./scripts/deploy.sh
```

The deploy script updates Git, installs dependencies, builds `dist/site`, and preserves the `dist/site` directory itself so Docker bind mounts stay valid.

## Private Site Footer

Footer HTML is injected from environment variables at dev/build time. The repository only tracks [.env.example](.env.example); real `.env` files stay local and are ignored by Git.

Set `SITE_FOOTER_HTML` to the complete footer markup when you want the footer to render. Leave it unset for public/open-source use.

The value may be one line:

```env
SITE_FOOTER_HTML='<footer class="site-footer">...</footer>'
```

Quoted multi-line HTML is also supported by the repository build scripts.

## Open Source Notes

- Generated outputs such as `dist/`, local logs, and dependency folders are ignored at the repository root.
- App-specific documentation stays close to the app under `apps/<app>/README.md` or `apps/<app>/docs/`.
- Add a root `LICENSE` before publishing this repository publicly so downstream users know how the code may be reused.
