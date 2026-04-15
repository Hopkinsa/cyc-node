import { Request, Response } from 'express';
import config from '../utility/config.ts';
import ComplexityReport from '../utility/generate-report.ts';
import { IReportConfig } from '../interface/config.interface.ts';

const REPORTS = config.REPORTS;
const BASE_PATH = config.REPORT_BASE_PATH;

type ReportFolder = {
  name: string;
  displayName: string;
};

class Report {
  static formatFolderDisplayName = (folderName: string): string => {
    const match = folderName.match(/-(\d{14})$/);

    if (!match) {
      return folderName;
    }

    const timestamp = match[1];
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(4, 6);
    const day = timestamp.slice(6, 8);
    const hour = timestamp.slice(8, 10);
    const minute = timestamp.slice(10, 12);
    const second = timestamp.slice(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

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
        displayName: Report.formatFolderDisplayName(folderName),
      })
    );

    res.render('reports', { report, folders, reportPath, idx });
  };

  static getCodebases = async (req: Request, res: Response): Promise<void> => {
    res.render('home', { reports: REPORTS });
  };
}

export default Report;
