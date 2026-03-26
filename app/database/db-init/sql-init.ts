export const REPORT_TABLE = `
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY,
    report TEXT NOT NULL
);
`;

export const FILE_TABLE = `
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY,
    report_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    fileComplexity INTEGER,
    totalFunctions INTEGER,
    totalComplexity	INTEGER,
    averageComplexity INTEGER
);
`;

export const FUNCTION_TABLE = `
CREATE TABLE IF NOT EXISTS functions (
    id INTEGER PRIMARY KEY,
    report_id INTEGER NOT NULL,
    summary_id INTEGER NOT NULL,
    function TEXT NOT NULL,
    line INTEGER,
    functionComplexity INTEGER
);
`;
