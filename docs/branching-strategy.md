# Warrigal Park FC — Branching Strategy

This document describes the Git branching model used in the Warrigal Park FC
registration system. It follows a light-weight Git Flow: short-lived feature
branches, an integration branch, and a protected production branch.

## Branches

| Branch        | Purpose                                                     | Lifetime            |
| ------------- | ----------------------------------------------------------- | ------------------- |
| `main`        | Production-ready code. Every commit on `main` is deployable. | Permanent         |
| `develop`     | Integration branch where completed features are merged.      | Permanent           |
| `feature/*`   | One short-lived branch per feature or fix.                   | Temporary (days)    |
| `hotfix/*`    | (Optional) urgent fix branched from `main`.                  | Temporary           |

## Workflow

```text
          feature/members   feature/registrations
             \  /              \  /
              develop  -------------->  main (tagged v1.0.0)
```

1. Create a feature branch from the latest `develop`:
   `git checkout -b feature/<name> develop`
2. Implement the feature in small, logical commits.
3. Push the branch and open a pull request back into `develop`.
4. After review, merge the pull request and delete the feature branch.
5. When the set of features is ready, merge `develop` into `main` and tag a
   release (`git tag vX.Y.Z`).

## Commit Message Convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <subject>

feat(members): add member records with search and deactivation
feat(guardians): link one guardian to several juniors
feat(registrations): refuse completing junior registration without guardian
feat(teams): place registered players into teams and move them
docs(readme): document deployment steps
build(ci): add lint job to CI pipeline
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`,
`ci`, `chore`.

## Rules

- `main` is protected: changes only enter through reviewed pull requests.
- Feature branches are short-lived and deleted after merging.
- Never commit directly to `main` or `develop`.
- `.gitignore`d files (e.g. `node_modules/`, `.env`) are never committed.
