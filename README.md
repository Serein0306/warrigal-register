# Warrigal Park FC — Registration & Rosters

A member registration and team roster system for **Warrigal Park Football Club**
(a community football club in Bald Hills, Brisbane), built with **React** and
**Vite**.

The application replaces the club's master spreadsheet and the junior
coordinator's copies of it. It gives the registrar one place to record a
season's registrations, and the junior coordinator one place to build teams and
see who is in them.

## Features

- **Members** — create, search, update and deactivate member (player) records,
  with name, date of birth and contact details.
- **Guardians** — a guardian record is held **once** and linked to every junior
  they are responsible for; updating the guardian's mobile updates it for all
  linked juniors.
- **Registrations** — register a member for a season with an age group, and move
  the registration through started → complete → withdrawn.
- **Domain rule** — a member under 18 **cannot** complete a registration unless
  at least one guardian is linked; the attempt is refused with a reason.
- **Teams & rosters** — create teams, place registered players, move players
  between teams, remove players, and list a roster with the correct contact for
  each player (guardian for juniors, own details for seniors).
- **Views** — team roster with contacts, a member's registration history, and
  the juniors linked to a guardian.
- **Dashboard** — totals and registrations by age group for the club president.
- Data persists in the browser (localStorage); sample data is loaded on first run.

## Tech Stack

| Area        | Choice             | Purpose                              |
| ----------- | ------------------ | ------------------------------------ |
| Framework   | React 18           | User interface components            |
| Build tool  | Vite 5             | Development server and bundling      |
| Language    | JavaScript (JSX)   | Application code                     |
| Linting     | ESLint 9           | Static code analysis                 |
| Formatting  | Prettier 3         | Consistent code style                |
| CI/CD       | GitHub Actions     | Lint, build and deploy automatically |
| Hosting     | GitHub Pages       | Static hosting of the built app      |

## Project Structure

```text
warrigal-register/
├── .github/workflows/     # CI and deployment pipelines
│   ├── ci.yml             # Lint + build on every push / pull request
│   └── deploy.yml         # Build and publish to GitHub Pages
├── docs/                  # Project documentation
│   ├── architecture.md    # Application architecture overview
│   └── branching-strategy.md # Git branching model
├── public/                # Static assets (favicon)
├── src/
│   ├── components/        # React components (Members, Guardians, Teams, ...)
│   ├── config/config.js   # Central, environment-driven configuration
│   ├── data/
│   │   ├── domain.js      # Domain rules (junior / guardian rule, age groups)
│   │   └── store.js       # Data access layer (CRUD + invariants, localStorage)
│   ├── styles/app.css     # Global styles
│   ├── App.jsx            # Root component and navigation
│   └── main.jsx           # Application entry point
├── .editorconfig          # Cross-editor style settings
├── .env.example           # Documented environment variables
├── .gitignore
├── eslint.config.js       # ESLint configuration
├── index.html
├── package.json           # Project metadata and scripts
├── vite.config.js         # Vite / build configuration
└── CHANGELOG.md           # Versioned change log
```

## Getting Started

### Prerequisites

- Node.js 18 or newer (https://nodejs.org)
- npm 9 or newer (ships with Node.js)
- A GitHub account for deployment (https://github.com)

### Install and run locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (http://localhost:5173)
npm run dev
```

### Other scripts

```bash
npm run build     # Create a production build in ./dist
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
npm run format    # Format all files with Prettier
```

## Configuration

All configurable values are read from environment variables at build time.
See [`.env.example`](.env.example) for the full list with explanations.

| Variable                | Default             | Description                             |
| ----------------------- | ------------------- | --------------------------------------- |
| `VITE_APP_TITLE`        | `Warrigal Park FC`  | Application title shown in the header   |
| `VITE_STORAGE_KEY`      | `wpfc.club.v1`      | localStorage key used for club records  |
| `VITE_CURRENT_SEASON`   | `2026`              | Season used for new registrations       |
| `VITE_SEASON_START`     | `2026-03-01`        | Season start date (junior age decision) |
| `VITE_BASE`             | `/`                 | Base path of the built application      |

To override locally, copy `.env.example` to `.env.local` and edit the values.
`.env*` files are excluded from version control by `.gitignore`.

## Deployment

The application is deployed to GitHub Pages by a GitHub Actions workflow
([`deploy.yml`](.github/workflows/deploy.yml)). On every push to `main`, the
workflow:

1. checks out the repository,
2. installs dependencies with `npm ci`,
3. builds the application with `npm run build`,
4. publishes the `dist/` folder to the `gh-pages` branch,
5. GitHub Pages serves the site at `https://<username>.github.io/<repository>/`.

### One-time setup

1. Push the repository to GitHub (see the Git workflow guide).
2. In the repository on GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch** and select
   the **gh-pages** branch with `/ (root)` as the folder.

## Branching Strategy

This project uses a light-weight Git Flow model:

- `main` – stable, production-ready code; every commit is deployable.
- `develop` – integration branch for completed features.
- `feature/*` – short-lived branches for individual features/fixes, merged back
  into `develop` (and `main` for releases).

Commit messages follow the
[Conventional Commits](https://www.conventionalcommits.org/) specification
(`feat:`, `fix:`, `docs:`, `build:`, `chore:`, ...).

See [docs/branching-strategy.md](docs/branching-strategy.md) for details.

## License

Distributed under the MIT License. See [LICENSE](LICENSE).
