import { execFile } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { promisify } from 'node:util';
import config from '../utility/config.ts';
import {
  INxReportConfig,
  IReportConfig,
  isNxReportConfig,
} from '../interface/config.interface.ts';
import { log } from './logger.ts';
import NxWorkspaceSlice from './nx-slice.ts';

const BASE_PATH = config.REPORT_BASE_PATH;
const execFileAsync = promisify(execFile);

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
    report: IReportConfig
  ): Promise<boolean> => {
    const reportFolder = ComplexityReport.generateReportName(report.FOLDER);
    const reportPath = `${BASE_PATH}/${report.FOLDER}`;
    const outputPath = `${reportPath}/${reportFolder}/`;

    if (isNxReportConfig(report)) {
      return ComplexityReport.generateNxReport(report, outputPath);
    }

    return ComplexityReport.generateStandardReport(report.PATH, outputPath);
  };

  static generateStandardReport = async (
    targetPath: string,
    outputPath: string
  ): Promise<boolean> => {
    try {
      return await ComplexityReport.runReport(targetPath, outputPath);
    } catch {
      // ingnore error
    }

    return false;
  };

  static generateNxReport = async (
    report: INxReportConfig,
    outputPath: string
  ): Promise<boolean> => {
    const slice = await NxWorkspaceSlice.create(report);

    try {
      log.info_lv2(`Generating Nx report for:`, report.PROJECT);
      log.info_lv2(`Using slice:`, slice.sliceRoot);

      return await ComplexityReport.runReport(slice.sliceRoot, outputPath);
    } catch {
      return false;
    } finally {
      await slice.cleanup();
    }
  };

  static runReport = async (
    targetPath: string,
    outputPath: string
  ): Promise<boolean> => {
    const targetTempDir = `${targetPath}/complexity`;
    const complexityExists = existsSync(`${targetTempDir}`);

    log.info_lv2(`Generating report for:`, targetPath);

    const existJS = existsSync(`${targetPath}/eslint.config.js`);
    const existCJS = existsSync(`${targetPath}/eslint.config.cjs`);
    const existMJS = existsSync(`${targetPath}/eslint.config.mjs`);
    if (!(existJS || existCJS || existMJS)) {
      return false;
    }

    try {
      await ComplexityReport.executeReportProcess(targetPath, outputPath);
    } finally {
    }

    if (existsSync(`${targetTempDir}/reports/function-names.all.md`)) {
      copyFileSync(
        `${targetTempDir}/reports/function-names.all.md`,
        `${outputPath}function-names.all.md`
      );
    }

    if (existsSync(`${targetTempDir}`) && !complexityExists) {
      rmSync(targetTempDir, { recursive: true, force: true });
      log.info_lv2(`Temp folder removed:`, targetTempDir);
    }

    return true;
  };

  static executeReportProcess = async (
    targetPath: string,
    outputPath: string
  ): Promise<void> => {
    const script = `
      import { generateComplexityReport } from '@pythonidaer/complexity-report';

      const targetPath = process.argv[1];
      const outputPath = process.argv[2];

      process.env.NX_WORKSPACE_ROOT_PATH = targetPath;
      globalThis.projectPath = targetPath;

      await generateComplexityReport({
        cwd: targetPath,
        outputDir: outputPath,
        showAllInitially: true,
      });
    `;

    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      ['--input-type=module', '--eval', script, targetPath, outputPath],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
        },
        timeout: 420000,
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    if (stdout.trim().length > 0) {
      process.stdout.write(stdout);
    }

    if (stderr.trim().length > 0) {
      process.stderr.write(stderr);
    }
  };
}
export default ComplexityReport;
