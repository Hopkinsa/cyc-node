import { Request, Response } from 'express';
import config from '../utility/config.ts';
import ComplexityReport from '../utility/generate-report.ts';
import { IReportConfig } from '../interface/config.interface.ts';
import { formatFolderDisplayName } from './helpers.ts';

const REPORTS = config.REPORTS;
const BASE_PATH = config.REPORT_BASE_PATH;

type ReportFolder = {
  name: string;
  displayName: string;
};

class Report {
  // Handling requests
  static generateReport = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const idx: number = parseInt(req.params['idx'] as string);
    const report = REPORTS[idx] as IReportConfig;
    const completed = await ComplexityReport.generate(report);

    const linkBack = `/reports/${idx}`;

    if (completed) {
      res.redirect(linkBack);
    } else {
      res.render('error', { report, linkBack });
    }
  };

  static getReports = async (req: Request, res: Response): Promise<void> => {
    const idx: number = parseInt(req.params['idx'] as string);
    const report = REPORTS[idx] as IReportConfig;
    const reportPath = `${BASE_PATH}/${report.FOLDER}`;

    const folders: ReportFolder[] = (await ComplexityReport.getFolders(report.FOLDER)).map(
      (folderName) => ({
        name: folderName,
        displayName: formatFolderDisplayName(folderName),
      })
    );

    res.render('reports', { report, folders, reportPath, idx });
  };

  static getCodebases = async (req: Request, res: Response): Promise<void> => {
    res.render('home', { reports: REPORTS });
  };
}

export default Report;
