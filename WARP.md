# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Purpose: Interactive dashboard to estimate likelihood of weather conditions for a specified location and date using historical NASA Earth observation data. Not a short-term forecast; focuses on probabilities of exceeding thresholds (e.g., very hot, very wet).
- Stack: Vite + React (JavaScript). No backend or data services wired yet; the app currently uses placeholder results.

How the code is structured (big picture)
- Entry point: src/main.jsx mounts the React app at #root and renders <App /> within React.StrictMode.
- Application component: src/App.jsx contains core UI, local state, and the placeholder compute action.
  - State: location, date, chosen condition flags, loading, and results.
  - Action flow: onCompute() simulates an async request (future integration point for NASA data services) and populates results for display.
  - UI: basic panels for input (location, date, condition toggles) and a results section.
- Tooling/configuration:
  - Vite config: vite.config.js with @vitejs/plugin-react for fast dev and production builds.
  - ESLint: eslint.config.js uses @eslint/js, eslint-plugin-react-hooks (recommended-latest), and eslint-plugin-react-refresh (vite). The npm lint script runs eslint . against the repo.
- Styles/assets: src/index.css and src/App.css are applied globally and per-component; assets/ contains static assets.

Commands you’ll commonly use
- Install dependencies
  - npm install
- Start the development server
  - npm run dev
- Build for production
  - npm run build
- Preview the production build locally
  - npm run preview
- Lint the project (ESLint)
  - npm run lint

Testing
- Run all tests: npm run test:run
- Watch mode (rerun on changes): npm run test:watch
- Open UI runner: npm run test:ui
- Coverage report: npm run coverage (outputs text + HTML + lcov)
- Run a single test file: npm run test:run -- src/App.test.jsx
- Run tests by name pattern: npm run test:run -- -t "renders title"

Important notes from the repository docs
- README.md outlines objectives, the intended variables/conditions, and getting started commands (install, dev, build, preview). Those commands are reflected above.

Agent considerations for future work
- Data integration: The compute action is a placeholder; future agents should introduce a proper data access layer/service for NASA datasets (e.g., API client and a request/aggregation pipeline) and keep the UI components thin.
- Configuration: If environment variables are introduced (e.g., Vite env files), document them here for agent workflows.
