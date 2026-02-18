import { Router } from 'express';
import Report from '../utility/report.ts';

export const REPORT_ROUTES = Router();

// Request handling
REPORT_ROUTES.post('/reports/:idx', Report.generateReport);

REPORT_ROUTES.get('/reports/:idx', Report.getReports);

REPORT_ROUTES.get('/', Report.getCodebases);
