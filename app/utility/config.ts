import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import * as path from 'path';
import {
  IAppConfig,
  IReportConfig,
  isNxReportConfig,
} from '../interface/config.interface.ts';

const CONFIG_PATH = './app/config.json';

let config: IAppConfig = {
  SERVER_PORT: null,
  REPORT_BASE_PATH: '',
  REPORTS: [],
};

const normalizeReportPath = (reportPath: string): string =>
  path.resolve(reportPath);

const normalizeRelativeConfigPath = (reportPath: string): string =>
  path.normalize(reportPath);

const validateReportConfig = (report: IReportConfig, index: number): IReportConfig => {
  if (!report.NAME || !report.PATH || !report.FOLDER) {
    throw new Error(
      `Invalid report config at REPORTS[${index}]. NAME, PATH and FOLDER are required.`
    );
  }

  const normalizedReport: IReportConfig = {
    ...report,
    PATH: normalizeReportPath(report.PATH),
    FOLDER: report.FOLDER.trim(),
    NAME: report.NAME.trim(),
  };

  if (isNxReportConfig(normalizedReport)) {
    if (
      !normalizedReport.PROJECT ||
      !normalizedReport.APP_ROOT ||
      !normalizedReport.LIB_SCOPE
    ) {
      throw new Error(
        `Invalid Nx report config at REPORTS[${index}]. PROJECT, APP_ROOT and LIB_SCOPE are required.`
      );
    }

    normalizedReport.APP_ROOT = normalizeRelativeConfigPath(
      normalizedReport.APP_ROOT
    );
    normalizedReport.LIB_SCOPE = normalizedReport.LIB_SCOPE.trim();
    normalizedReport.PROJECT = normalizedReport.PROJECT.trim();
  }

  return normalizedReport;
};

if (existsSync(CONFIG_PATH)) {
  const configFile = await readFile(CONFIG_PATH, 'utf8');
  const parsedConfig = JSON.parse(configFile) as IAppConfig;

  config = {
    SERVER_PORT: parsedConfig.SERVER_PORT ?? null,
    REPORT_BASE_PATH: '',
    REPORTS: Array.isArray(parsedConfig.REPORTS)
      ? parsedConfig.REPORTS.map(validateReportConfig)
      : [],
  };

  // Generate a full path to the reporting directory
  config.REPORT_BASE_PATH = path.resolve('./reporting');
}

export default config;
