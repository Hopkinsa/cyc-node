# CYCNode

This is a simple tool for working with [@pythonidaer/complexity-report](https://github.com/Pythonidaer/complexity-report).

**cyclomatic-complexity** is a package that calculates the complexity of code using the [Cyclometric Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity) metric and produces a JSON output.

## To install

In a command prompt, from the repository root, run

```bash
$ npm install
```

The `config.json` file in the `/app` folder needs to be edited to contain the values to set up the application and configure the codebase(s) to report on.

```json
{
    "SERVER_PORT": 3000,
    "REPORTS": [
        {
            "NAME": "",
            "PATH": "",
            "FOLDER": ""
        }
    ]
}
```

- SERVER_PORT: The port number to start the server on.
- REPORTS: Array of codebases.
  - NAME: Name of the codebase to display on screen.
  - PATH: The full path to the codebase to report on folder.
  - FOLDER: The folder name to use in /reporting to store the codebase reports in

## Prerequisites

The codebase that is having a report generated on it MUST have a working eslint configuration and the necessary packages or files installed.  If any package or files referenced in the configuration file can not be found, an error will be thrown.

The configuration file must be `eslint.config.js`, `eslint.config.mjs`, or `eslint.config.cjs` and available at the location entered in `REPORTS[].PATH`.  If a file can not be located, an error will be thrown.

To test a single project from a NX Monorepo, you can copy just the project code to a separate testbed and install only the necessary eslint files and packages.

For example the following monorepo
```
Root
  apps
    project_1
    project_2
    project_3
    project_4
  eslint-configs
    common.rules.js
    typescript.js
  libs
    libs_1
    libs_2
    libs_3
    libs_4
  tools
  eslint.config.js
  jest.cofig.js
  nx.json
  package.json
  tsconfig.json
```
can be copied to
```
Testbed
    test_folder
      apps
        project_3
      eslint-configs
        common.rules.js
        typescript.js
      eslint.config.js
      package.json
      tsconfig.json
```
IMPORTANT: remove any reference to NX from the eslint.config file and strip package.json of all dependencies not required by eslint, then run `npm i` in the test folder.

## To run the reporter

In a command prompt, from the repository root, run

```bash
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:3000/`.

## To generate a report

When the server is running and the browser has opened `http://localhost:3000/`, navigate to the codebase you wish to generate a report on and click on the `Generate Report` button.
