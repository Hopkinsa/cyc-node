# CYCNode

This is a simple tool for working with [@pythonidaer/complexity-report](https://github.com/Pythonidaer/complexity-report).

**cyclomatic-complexity** is a package that calculates the complexity of code using the [Cyclometric Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity) metric and produces a JSON output.

## To install

In a command prompt, from the repository root, run

```bash
npm install
```

The `config.json` file in the `/app` folder controls which codebases appear in the UI and how reports are generated.

The application supports two project modes:

- single-folder projects
- Nx monorepo projects

## Configuration

### Single-folder project

Use this mode for a normal project where the project root itself is the analysis target.

```json
{
  "SERVER_PORT": 3000,
  "REPORTS": [
    {
      "NAME": "My Project",
      "PATH": "/absolute/path/to/project-root",
      "FOLDER": "my-project"
    }
  ]
}
```

- `SERVER_PORT`: Port used by the web app.
- `REPORTS`: Array of report targets.
- `NAME`: Label shown in the UI.
- `PATH`: Absolute path to the project root that will be analyzed.
- `FOLDER`: Folder name used under `reporting/` for generated reports.

### Nx monorepo project

Use this mode when the code to analyze lives inside an Nx workspace and you want the report to be scoped to one app, its same-scope libraries, and only the `libs/shared` code that is actually required.

```json
{
  "SERVER_PORT": 3000,
  "REPORTS": [
    {
      "NAME": "My Project",
      "PATH": "/absolute/path/to/project-root",
      "FOLDER": "my-project"
      "MODE": "nx",
      "PROJECT": "myproject",
      "APP_ROOT": "apps/myproject",
      "LIB_SCOPE": "myproject"
    }
  ]
}
```

Additional Nx fields:

- `MODE`: Must be `nx`.
- `PROJECT`: Nx project name.
- `APP_ROOT`: App folder relative to the Nx workspace root.
- `LIB_SCOPE`: Library scope to include, normally matching the app name.


## How Nx Mode Works

For Nx targets, the application does not run the complexity report against the full monorepo root.

Instead it:

1. creates a temporary copied workspace slice under `test-results/complexity-slices/`
2. copies the selected app root
3. copies all libraries under `libs/<scope>`
4. discovers and copies only the required `libs/shared/**` library roots
5. preloads the Nx project graph inside that copied slice
6. runs the report in an isolated child Node process
7. removes the temporary slice when the run completes

This keeps the report scoped to the selected app while still allowing ESLint and Nx rules to resolve correctly.

## Prerequisites

### Single-folder projects

The project being analyzed must have:

- a working ESLint flat config
- all packages and local files referenced by that config installed and available
- one of `eslint.config.js`, `eslint.config.mjs`, or `eslint.config.cjs` at the configured `PATH`

If any package or referenced file is missing, the report run will fail.

### Nx projects

The Nx workspace root configured in `PATH` must have:

- `nx.json`
- `package.json`
- `tsconfig.base.json`
- `tsconfig.eslint.json`
- a root ESLint flat config
- any shared config modules referenced by the ESLint setup

The selected `APP_ROOT` must exist, and the selected `LIB_SCOPE` must map to libraries under `libs/<scope>`.

You do not need to create a manual testbed copy for Nx workspaces anymore. The application now creates and removes the copied slice automatically.

## Output And Storage

Generated reports are stored under:

```text
reporting/<folder>/<folder>-<timestamp>/
```

Examples:

- `reporting/my-project/my-project-20260415122357/`
- `reporting/my-other-project/my-other-project-20260415122357/`

The generated markdown is still ingested into the SQLite database used by the summary and comparison views.

## To run the reporter

In a command prompt, from the repository root, run

```bash
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:3000/`.

## To generate a report

When the server is running and the browser has opened `http://localhost:3000/`, navigate to the codebase you want to analyze and click `Generate Report`.

For each configured target you can then:

- open the full HTML report
- open the summary view backed by SQLite
- compare dated runs within the same report folder
