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

## Private Site Footer

Footer HTML is injected from environment variables at dev/build time. The repository only tracks [.env.example](.env.example); real `.env` files stay local and are ignored by Git.

Set `SITE_FOOTER_HTML` to the complete footer markup when you want the footer to render. Leave it unset for public/open-source use.

## Open Source Notes

- Generated outputs such as `dist/`, local logs, and dependency folders are ignored at the repository root.
- App-specific documentation stays close to the app under `apps/<app>/README.md` or `apps/<app>/docs/`.
- Add a root `LICENSE` before publishing this repository publicly so downstream users know how the code may be reused.
