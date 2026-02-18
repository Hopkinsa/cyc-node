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

## To run the reporter

In a command prompt, from the repository root, run

```bash
npm run start
```

Once the server is running, open your browser and navigate to `http://localhost:3000/`.

## To generate a report

**Note**: The codebase that is having a report generated on it MUST have an `eslint.config.js`, `eslint.config.mjs`, or `eslint.config.cjs` file at the location entered in `REPORTS[].PATH`.  If a file can not be located, an error will be thrown.

When the server is running and the browser has opened `http://localhost:3000/`, navigate to the codebase you wish to generate a report on and click on the `Generate Report` button.
