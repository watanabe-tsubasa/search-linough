# Repository Guidelines

## Language
Basically, English please.
userはたまに日本語で書いてきますが、返答は英語で問題ありません。

## Project Structure & Module Organization
Source lives in `app/`, using React Router file-based routes (`app/routes/*.tsx`) for loaders and UI. Shared UI lives in `app/components/`, reusable hooks under `app/Hooks/`, and Supabase access is isolated in `app/lib/supabase/`. Domain types stay in `app/types.ts` and helpers in `app/utils.ts`. Static assets belong in `public/`. Avoid touching the generated `build/` output. Place new Vitest specs in `tests/` or alongside modules as `*.test.ts` files.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Run `npm run dev` for the local dev server with HMR at `http://localhost:5173`. Use `npm run build` to emit the production bundle into `build/client` and `build/server`, and `npm run start` to serve that bundle locally. Execute `npm run typecheck` before PRs to generate route types and run `tsc`. Run the Vitest suite with `npm test`; append `-- --watch` while iterating.

## Coding Style & Naming Conventions
Write components in TypeScript with 2-space indentation and trailing commas in multiline literals. Prefer named exports from modules; default exports are reserved for route components required by React Router. Use `PascalCase` for React components, `camelCase` for functions and variables, and `SCREAMING_SNAKE_CASE` only for true constants. JSX props should be double-quoted, matching the existing formatting. Keep Tailwind utility classes organized by layout → spacing → color to stay consistent with current markup.

## Testing Guidelines
Vitest drives unit tests; mimic existing specs in `tests/utils.test.ts`. Name suites with the function under test and keep expectations in plain English. New features need matching happy-path and guard-rail tests. Run `npm test` locally and ensure failures exit non-zero. Snapshot tests are acceptable only for stable UI fragments. Record any skipped coverage follow-ups in `progress.md`.

## Commit & Pull Request Guidelines
Commits follow short, imperative messages (see `git log` – e.g., `Align house routes with shared Supabase types`). Group related changes and avoid WIP commits. Pull requests should include: concise summary, linked issue or task ID, test evidence (command output or checklist), and screenshots/GIFs for UI tweaks. Use draft PRs while work is in flux, and request review only once `npm run build` and `npm test` succeed locally.
