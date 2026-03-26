
export const GET_ALL_REPORTS = `SELECT id, report FROM reports`;
export const GET_ALL_FILES = `SELECT id, report_id, filename, fileComplexity, totalFunctions, totalComplexity, averageComplexity FROM files`;
export const GET_ALL_FUNCTIONS = `SELECT id, report_id, summary_id, function, line, functionComplexity FROM functions`;

export const GET_REPORT_BY_NAME = `SELECT id FROM reports WHERE report = ?`;
export const GET_ALL_REPORT_FILES = `SELECT id, report_id, filename, fileComplexity, totalFunctions, totalComplexity, averageComplexity FROM files WHERE report_id = ?`;
export const GET_ALL_REPORT_FILE_FUNCTIONS = `SELECT id, report_id, summary_id, function, line, functionComplexity FROM functions WHERE report_id = ? AND summary_id = ?`;



export const GET_COMPARE_REPORT_FILES = `
SELECT filename, fileComplexity, totalFunctions, totalComplexity, averageComplexity, '1' AS report FROM files WHERE report_id = ?
UNION ALL
SELECT filename, fileComplexity, totalFunctions, totalComplexity, averageComplexity, '2' AS report FROM files WHERE report_id = ?
ORDER BY filename ASC
`;
