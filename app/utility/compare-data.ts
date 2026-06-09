import { Request, Response } from 'express';
import config from './config.ts';
import { formatFolderDisplayName } from './helpers.ts';

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
    const targetNames: reportBody = {
      tgt_1: formatFolderDisplayName(targetSort.tgt_1),
      tgt_2: formatFolderDisplayName(targetSort.tgt_2),
    }
    const reportId1 = await DBRead.reportExists(targetSort.tgt_1);
    const reportId2 = await DBRead.reportExists(targetSort.tgt_2);

    if (reportId1 < 0 || reportId2 < 0) {
      // Error
    }

    const reportTarget = targetSort.tgt_1.split('-')[0].toUpperCase();

    const complexityObj = DBRead.processCompareData(await DBRead.compareReports(reportId1, reportId2));

    res.render('compare', { reportTarget, targetNames, complexityObj });
  };
}
export default ComparisonReport;
