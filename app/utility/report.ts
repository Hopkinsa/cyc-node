import { Request, Response } from 'express';
import config from '../utility/config.ts';
import ComplexityReport from '../utility/generate-report.ts';

const REPORTS = config.REPORTS;
const BASE_PATH = config.REPORT_BASE_PATH;

class Report {
  // Handling requests
  static generateReport = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const idx: number = parseInt(req.params['idx'] as string);
    const report = REPORTS[idx] as any;
    const completed = await ComplexityReport.generate(
      report.PATH,
      report.FOLDER
    );

    const linkBack = `/reports/${idx}`;

    if (completed) {
      res.redirect(linkBack);
    } else {
      res.render('error', { report, linkBack });
    }
  };

  static getReports = async (req: Request, res: Response): Promise<void> => {
    const idx: number = parseInt(req.params['idx'] as string);
    const report = REPORTS[idx] as any;
    const reportPath = `${BASE_PATH}/${report.FOLDER}`;

    const folders = await ComplexityReport.getFolders(report.FOLDER);
    res.render('reports', { report, folders, reportPath });
  };

  static getCodebases = async (req: Request, res: Response): Promise<void> => {
    res.render('home', { reports: REPORTS });
  };
}

export default Report;
