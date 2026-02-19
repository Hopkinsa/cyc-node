import { Router } from 'express';
import Report from '../utility/report.ts';
import Summary from '../utility/summary.ts';

export const REPORT_ROUTES = Router();

// Request handling
REPORT_ROUTES.get('/reports/:idx/:tgt', Summary.getSummary);

REPORT_ROUTES.post('/reports/:idx', Report.generateReport);

REPORT_ROUTES.get('/reports/:idx', Report.getReports);

REPORT_ROUTES.get('/', Report.getCodebases);
