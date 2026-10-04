## [Unreleased]
- Improve: expand deployment & environment configuration notes
- Add: extra comments for environment configuration guidance

# Changelog

All notable changes to the Warrigal Park FC registration system are documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-10-04

### Added

- Initial release of the Warrigal Park FC registration and roster system.
- Members: create, search, update and deactivate member records.
- Guardians: single guardian records linked to one or more juniors.
- Registrations: create, complete and withdraw registrations per season with
  an age group and a status (started / complete / withdrawn).
- Domain rule: completing a registration for a member under 18 is refused
  unless at least one guardian is linked to them.
- Teams and rosters: create and rename teams, place registered players, move
  players between teams, remove players, and list rosters with contacts.
- Views: roster with contacts, member registration history, juniors linked to
  a guardian.
- Dashboard: totals and registrations by age group for the club president.
- Sample data loaded on first run so the application can be demonstrated.
- Centralised, environment-driven application configuration.
- CI pipeline (lint + build) via GitHub Actions.
- Automated deployment to GitHub Pages via GitHub Actions.
- Project documentation (README, architecture, branching strategy).
