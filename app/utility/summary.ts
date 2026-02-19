import { Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import config from './config.ts';
import { jsonComplexity } from '../interface/eslint.interface.ts';

const REPORTS = config.REPORTS;
const BASE_PATH = config.REPORT_BASE_PATH;

interface dataObject {
  file: string;
  issues: number;
  complexity: number;
}

class SummaryReport {
  static loadJSONReport = async (
    folderPath: string,
    target: string
  ): Promise<jsonComplexity[]> => {
    const filepath = `${BASE_PATH}/${folderPath}/${target}/complexity-report.json`;
    let complexityJSON: jsonComplexity[] = [];
    if (existsSync(filepath)) {
      const complexityFile = await readFile(filepath, { encoding: 'utf8' });
      complexityJSON = JSON.parse(complexityFile);
    }
    return complexityJSON;
  };

  static processSummary = async (
    jsonObj: jsonComplexity[],
    removeStr: string
  ): Promise<dataObject[]> => {
    const data: dataObject[] = [];

    jsonObj.forEach((item) => {
      const dataItem = {
        file: item.filePath.replace(removeStr, ''),
        issues: item.errorCount + item.warningCount,
        complexity: 0,
      };
      if (item.messages.length > 0) {
        const used: string[] = [];
        item.messages.forEach((msg) => {
          // Only read a message if it relates to complexity
          if (msg.messageId === 'complex') {
            // filter out certain noteTypes if already seen before (e.g. anonymous)
            if (!used.includes(msg.nodeType)) {
              const score = msg.message.match(/\d{1,3}/gm) || ['0'];
              dataItem.complexity += parseInt(score[0]);
              // only add to filter if not one of the items in the array
              if (!['FunctionExpression'].includes(msg.nodeType)) {
                used.push(msg.nodeType);
              }
            }
          }
        });
      }
      // ignore html and files with no complexity
      if (dataItem.file.indexOf('.html') < 0 && dataItem.complexity > 0) {
        data.push(dataItem);
      }
    });
    return data;
  };

  static getSummary = async (req: Request, res: Response): Promise<void> => {
    const idx: number = parseInt(req.params['idx'] as string);
    const target: string = req.params['tgt'] as string;
    const report = REPORTS[idx] as any;
    const jsonObj = await SummaryReport.loadJSONReport(report.FOLDER, target);
    const complexityObj = await SummaryReport.processSummary(
      jsonObj,
      report.PATH
    );
    res.render('summary', { report, target, idx, complexityObj });
  };
}
export default SummaryReport;
