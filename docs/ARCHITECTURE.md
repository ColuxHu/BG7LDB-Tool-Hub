# Monorepo Structure

This repository follows an app-first monorepo layout:

- `apps/*` contains independently runnable and deployable web applications.
- The repository root contains shared tooling, workspace scripts, and project-wide documentation.
- App-local assets, docs, scripts, and public files stay inside the owning app.

## Workspace Conventions

- Each app has its own `package.json` with a scoped package name.
- Root scripts delegate to app workspaces instead of reaching into app folders manually.
- Local site routing and deployable site assembly discover `apps/*/index.html` automatically.
- Runtime assets that must be deployed with an app live inside that app.
- Build outputs, local logs, and dependency folders are not source files and are ignored.

## Current Apps

- `apps/tool-hub`: navigation hub for the public tool collection.
- `apps/luggage-tag`: tricolor e-ink luggage tag generator.
- `apps/table-tennis-doubles`: static PWA for doubles scoring and serving order.
- `apps/chinese-telecode`: Vite-based Chinese telecode conversion app with data generation scripts.
