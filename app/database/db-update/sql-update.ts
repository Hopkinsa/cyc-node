export const UPDATE_REPORT_DATA = `UPDATE reports SET report = ? WHERE id = ?`;
export const CREATE_REPORT_DATA = `INSERT INTO reports ("report") VALUES (?)`;


export const UPDATE_FILE_DATA = `UPDATE files SET report_id = ?, filename = ?, fileComplexity = ?, totalFunctions = ?, totalComplexity = ?, averageComplexity = ? WHERE id = ?`;
export const CREATE_FILE_DATA = `INSERT INTO files ("report_id", "filename", "fileComplexity", "totalFunctions", "totalComplexity", "averageComplexity") VALUES (?, ?, ?, ?, ?, ?)`;


export const UPDATE_FUNCTION_DATA = `UPDATE functions SET report_id = ?, summary_id = ?, function = ?, line = ?, functionComplexity = ? WHERE id = ?`;
export const CREATE_FUNCTION_DATA = `INSERT INTO functions ("report_id", "summary_id", "function", "line", "functionComplexity") VALUES (?, ?, ?, ?, ?)`;
