import { Request, Response } from 'express';
import config from './config.ts';

import DBRead from '../database/db-read/db-read.ts';

const REPORTS = config.REPORTS;

type reportBody = {
  tgt_1: string;
  tgt_2: string;
};

class ComparisonReport {
  static dynamicSort = (properties: any) => {
    return function (a: any, b: any): any {
      for (const prop of properties) {
        if (a[prop] < b[prop]) {
          return -1;
        }
        if (a[prop] > b[prop]) {
          return 1;
        }
      }
      return 0;
    };
  };

  static getComparisonReport = async (req: Request, res: Response): Promise<void> => {
    const targets: reportBody = req.body;
    const targetSort: reportBody = {
      tgt_1: (targets.tgt_1 < targets.tgt_2) ? targets.tgt_1 : targets.tgt_2,
      tgt_2: (targets.tgt_1 > targets.tgt_2) ? targets.tgt_1 : targets.tgt_2,
    }
    const reportId_1 = await DBRead.reportExists(targetSort.tgt_1);
    const reportId_2 = await DBRead.reportExists(targetSort.tgt_2);

    if (reportId_1 < 0 || reportId_2 < 0) {
      // Error
    }

    const complexityObj = DBRead.processCompareData(await DBRead.compareReports(reportId_1, reportId_2));

    res.render('compare', { targetSort, complexityObj });
  };
}
export default ComparisonReport;
