import { Request, Response } from 'express';
import { createReadStream, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import config from './config.ts';
import { jsonComplexity } from '../interface/eslint.interface.ts';

const REPORTS = config.REPORTS;
const BASE_PATH = config.REPORT_BASE_PATH;
const SUMMARY_START_LINE = 9;

type functionComplexity = {
  name: string;
  complexity: number;
  file: string;
  line: number;
};
type functionObject = {
  name: string;
  line: number;
  complexity: number;
};
type dataObject = {
  file: string;
  complexity: number;
  functions: functionObject[];
};

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
    let functionArray: functionObject[] = [];

    let used: string[] = [];
    functions.forEach((item) => {
      // reset on new file
      if (file !== item.file) {
        if (file !== '') { data.push(
          {
            file,
            complexity,
            functions: functionArray
          }
        ); }
        file = item.file;
        complexity = 0;
        functionArray = [];
        used = [];
      }
      const functionItem = {
        name: item.name,
        line: item.line,
        complexity: item.complexity,
      };
      functionArray.push(functionItem);
      if (!used.includes(item.name)) {
        complexity += item.complexity;
        used.push(item.name);
      }
    });
    return data;
  };

  static getSummary = async (req: Request, res: Response): Promise<void> => {
    const idx: number = parseInt(req.params['idx'] as string);
    const target: string = req.params['tgt'] as string;
    const report = REPORTS[idx] as any;
    const functionData = await SummaryReport.loadFunctionReport(
      report.FOLDER,
      target
    );
    const complexityObj = await SummaryReport.processSummary(functionData);

    res.render('summary', { report, target, idx, complexityObj });
  };
}
export default SummaryReport;
