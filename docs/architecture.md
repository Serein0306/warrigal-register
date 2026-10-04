# Warrigal Park FC Registration System — Architecture

## Overview

This is a single-page application (SPA) built with React 18 and bundled with
Vite 5. It is a purely client-side application: all club records are stored in
the browser using the Web Storage API (`localStorage`), which removes the need
for a backend server and database. The data access layer centralises all reads
and writes so the persistence mechanism could be swapped for a real backend
later without changing the UI components.

## Domain Model

```text
Member  (player: name, date of birth, contact, school, medical notes, active)
Guardian (parent/legal guardian: name, relationship, phone, email, address)
MemberGuardianLink (memberId <-> guardianId; one guardian serves many juniors)
Registration (memberId, season, ageGroup, status: started|complete|withdrawn)
Team (name, season, ageGroup)
Placement (teamId, memberId, season)
```

## Component Diagram

```text
main.jsx
  └── App.jsx                      (navigation tabs; owns refresh state)
        ├── Dashboard.jsx          (season totals, registrations by age group)
        ├── MemberList.jsx         (search + list) → MemberForm / MemberDetail
        ├── GuardianList.jsx       (list) → GuardianForm / GuardianDetail
        ├── RegistrationList.jsx   (season/status filters + actions)
        └── TeamList.jsx           (teams + RosterCard per team)
```

## Data Flow

1. All reads go through `src/data/store.js`, which loads from `localStorage`.
2. UI components call store functions, then the app-level `refresh()` tick
   forces views to re-read the data.
3. Domain rules live in `src/data/domain.js` (`isJunior`, `canCompleteRegistration`)
   and are enforced inside the store functions (e.g. `completeRegistration`,
   `addPlayerToTeam`), so a rule cannot be bypassed by the UI.

## Key Domain Logic

- **Junior rule**: a member is a junior when their age on the season start date
  (`VITE_SEASON_START`) is under 18. `completeRegistration` refuses (with a
  reason) to complete a junior registration that has no linked guardian.
- **Guardian linkage**: guardians are linked by id (not by a name typed on the
  child's record). Updating a guardian's mobile updates it for every linked
  junior at once.
- **Placement rule**: only members with a *complete* registration for the
  team's season can be placed in a team; moving/removing a player never deletes
  their registration.

## Configuration Management

- All environment-specific values are centralised in `src/config/config.js`,
  which reads `import.meta.env` variables injected by Vite at build time.
- `.env.example` documents every variable and is committed to the repository;
  actual `.env*` files are ignored by `.gitignore`.
- `vite.config.js` reads `VITE_BASE` so the same source can be deployed to a
  sub-path (GitHub Pages project site) without code changes.
- Dependencies are pinned in `package-lock.json` (committed) and installed with
  `npm ci` in CI to guarantee reproducible builds.

## Deployment

See `.github/workflows/deploy.yml`. The workflow builds the application and
publishes `dist/` to the `gh-pages` branch, which GitHub Pages serves.
