# Frontend — React + TypeScript (Vite)

This frontend is implemented with Vite, React and TypeScript and provides the user interface for project management, generation controls, review, and graph visualization.

Quick commands
--------------
- Install dependencies: `npm install`
- Development server: `npm run dev`
- Build for production: `npm run build`
- Lint: `npm run lint` (if configured)

Structure highlights
--------------------
- `src/main.tsx` — application entry and router
- `src/pages/` — page-level views (Dashboard, Project, Review, Graph)
- `src/api/` — API client wrappers (`client.ts`, `projects.ts`, `generate.ts`)
- `src/components/` — reusable UI and modals

Integration notes
-----------------
- The frontend expects the backend API base URL to be available via environment configuration (see `frontend/vite.config.ts` and `src/api/client.ts`).
- Authentication is JWT-based; tokens are stored client-side and sent on API requests.

If you need a targeted change (for example: add an env var, enable the React compiler, or wire additional lint rules), request the change and I will update the project configuration accordingly.
