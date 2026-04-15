import { Request, Response } from 'express';
import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import config from './config.ts';
import { jsonComplexity } from '../interface/eslint.interface.ts';
import {
  IFiles,
  IFunctions,
  IReports,
} from '../interface/report-data.interface.ts';
import {
  dataObject,
  functionComplexity,
  functionObject,
} from '../interface/summary.interface.ts';

import DBUpdate from '../database/db-update/db-update.ts';

import DBRead from '../database/db-read/db-read.ts';

const REPORTS = config.REPORTS;
const BASE_PATH = config.REPORT_BASE_PATH;
const SUMMARY_START_LINE = 9;

class SummaryReport {
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

  static loadFunctionReport = async (
    folderPath: string,
    target: string
  ): Promise<functionComplexity[]> => {
    const filepath = `${BASE_PATH}/${folderPath}/${target}/function-names.all.md`;
    const data: functionComplexity[] = [];
    if (existsSync(filepath)) {
      const fileStream = createReadStream(filepath);

      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in input.txt as a single line break.
      let lineNumber = 0;
      for await (const line of rl) {
        lineNumber++;

        if (lineNumber > SUMMARY_START_LINE) {
          // Each line in input.txt will be successively available here as `line`.
          const dataLine = line.split('|');
          const fileAndLine = dataLine[3].trim().split(':');
          data.push({
            name: dataLine[1].trim(),
            complexity: parseInt(dataLine[2].trim()),
            file: fileAndLine[0].trim(),
            line: parseInt(fileAndLine[1].trim()),
          });
        }
      }
    }
    const sortedData = data.sort(
      SummaryReport.dynamicSort(['file', 'name', 'line'])
    );
    return sortedData;
  };

  static processSummary = async (
    functions: functionComplexity[]
  ): Promise<dataObject[]> => {
    const data: dataObject[] = [];
    let file = '';
    let complexity = 0;
    let complexityTotal = 0;
    let functionArray: functionObject[] = [];

    let used: string[] = [];
    functions.forEach((item) => {
      // reset on new file
      if (file !== item.file) {
        if (file !== '') {
          data.push({
            file,
            complexity,
            functions: functionArray,
            functionTotal: functionArray.length,
            complexityTotal: complexityTotal,
            complexityAverage: complexityTotal / functionArray.length,
          });
        }
        file = item.file;
        complexity = 0;
        complexityTotal = 0;
        functionArray = [];
        used = [];
      }
      const functionItem = {
        name: item.name,
        line: item.line,
        complexity: item.complexity,
      };
      functionArray.push(functionItem);
      complexityTotal += item.complexity;

      // Filter out functions with the same name, as per original report
      if (!used.includes(item.name)) {
        complexity += item.complexity;
        used.push(item.name);
      }
    });
    return data;
  };

  static createData = async (folder: string, target: string): Promise<void> => {
      const loadedData = await SummaryReport.loadFunctionReport(
        folder,
        target
      );

      const tmpObj = await SummaryReport.processSummary(loadedData);
      const tmpReportData: IReports = { report: target };
      const tmpReportId = await DBUpdate.createReports(tmpReportData);

      tmpObj.forEach(async (fileItem) => {
        const fileData: IFiles = {
          report_id: tmpReportId,
          filename: fileItem.file,
          fileComplexity: fileItem.complexity,
          totalFunctions: fileItem.functionTotal,
          totalComplexity: fileItem.complexityTotal,
          averageComplexity: fileItem.complexityAverage,
        };
        const fileId = await DBUpdate.createFiles(fileData);

        if (fileItem.functions.length > 0) {
          fileItem.functions.forEach(async (functionItem) => {
            const functiomData: IFunctions = {
              report_id: tmpReportId,
              summary_id: fileId,
              function: functionItem.name,
              line: functionItem.line,
              functionComplexity: functionItem.complexity,
            };
            const functionId = await DBUpdate.createFunctions(functiomData);
          });
        }
      });
  }

  static getSummary = async (req: Request, res: Response): Promise<void> => {
    const idx: number = parseInt(req.params['idx'] as string);
    const target: string = req.params['tgt'] as string;
    const report = REPORTS[idx] as any;
    let reportId = await DBRead.reportExists(target);

    if (reportId < 0) { // If data missing, create it
      await SummaryReport.createData(report.FOLDER, target);

      reportId = await DBRead.reportExists(target);
    }

    const complexityObj = await DBRead.getReportById(reportId);

    res.render('summary', { report, target, idx, complexityObj });
  };
}
export default SummaryReport;
