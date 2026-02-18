import { existsSync, readdirSync, rmSync } from 'node:fs';
import { generateComplexityReport } from '@pythonidaer/complexity-report';
import config from '../utility/config.ts';
import { log } from './logger.ts';

const BASE_PATH = config.REPORT_BASE_PATH;

class ComplexityReport {
  static listReportFolders = async (folderPath: string): Promise<string[]> => {
    const foldernames = await readdirSync(folderPath);
    const filteredFolders: string[] = foldernames.filter(
      (name) => name !== '.DS_Store'
    );
    return filteredFolders;
  };

  static getFolders = async (output: string): Promise<string[]> => {
    const reportPath = `${BASE_PATH}/${output}`;
    let folders: string[] = [];
    if (existsSync(reportPath)) {
      folders = await ComplexityReport.listReportFolders(`${reportPath}`);
    }
    return folders;
  };

  static generateReportName = (output: string): string => {
    const oDate = new Date();
    const ymdTime = `${oDate.getFullYear().toString().padStart(2, '0')}${(oDate.getMonth() + 1).toString().padStart(2, '0')}${oDate.getDate().toString().padStart(2, '0')}`;
    const hmsTime = `${oDate.getHours().toString().padStart(2, '0')}${oDate.getMinutes().toString().padStart(2, '0')}${oDate.getSeconds().toString().padStart(2, '0')}`;
    const reportName = `${output}-${ymdTime}${hmsTime}`;
    return reportName;
  };

  static generate = async (
    target: string,
    output: string
  ): Promise<boolean> => {
    const reportFolder = ComplexityReport.generateReportName(output);
    const targetPath = `${target}`;
    const targetTempDir = `${targetPath}/complexity`;
    const reportPath = `${BASE_PATH}/${output}`;
    const outputPath = `${reportPath}/${reportFolder}/`;
    try {
      const complexityExists = existsSync(`${targetTempDir}`);
      log.info_lv2(`Generating report for:`, targetPath);

      // One of the following must exists, otherwise generateComplexityReport will crash
      const existJS = existsSync(`${targetPath}/eslint.config.js`);
      const existCJS = existsSync(`${targetPath}/eslint.config.cjs`);
      const existMJS = existsSync(`${targetPath}/eslint.config.mjs`);
      if (existJS || existCJS || existMJS) {
        const report = await generateComplexityReport({
          cwd: targetPath,
          outputDir: outputPath,
          showAllInitially: true,
        });

        // A 'complexity' folder is created in the targetPath which is used for generating the report
        // This removes that folder UNLESS it already exists
        if (existsSync(`${targetTempDir}`) && !complexityExists) {
          rmSync(targetTempDir, { recursive: true, force: true });
          log.info_lv2(`Temp folder removed:`, targetTempDir);
        }
        return true;
      }
    } catch {}

    return false;
  };
}
export default ComplexityReport;
