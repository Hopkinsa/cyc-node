import { log } from '../../utility/logger.ts';
import DBService from '../../services/db.service.ts';
import {
  IFiles,
  IFunctions,
  IReports,
} from '../../interface/report-data.interface.ts';
import {
  dataObject,
  dataObjectCompare,
  functionObject,
} from '../../interface/summary.interface.ts';
import {
  GET_ALL_FILES,
  GET_ALL_FUNCTIONS,
  GET_ALL_REPORT_FILE_FUNCTIONS,
  GET_ALL_REPORT_FILES,
  GET_ALL_REPORTS,
  GET_COMPARE_REPORT_FILES,
  GET_REPORT_BY_NAME,
} from './sql-read.ts';

const DEBUG = 'db-read | ';

class DBRead {
  static getReports = async (): Promise<void> => {
    log.info_lv2(`${DEBUG}getReports`);

    const data = DBService.db.prepare(GET_ALL_REPORTS).all();
  };

  static reportExists = async (
    reportName: string
  ): Promise<number | bigint> => {
    log.info_lv2(`${DEBUG}reportExists - ${reportName}`);

    const data = await DBService.db.prepare(GET_REPORT_BY_NAME).get(reportName);
    if (data === undefined) {
      return -1;
    }

    return (data as IReports).id as number;
  };

  static getFiles = async (): Promise<void> => {
    log.info_lv2(`${DEBUG}getFiles`);

    const data = DBService.db.prepare(GET_ALL_FILES).all();
  };

  static getFunctions = async (): Promise<void> => {
    log.info_lv2(`${DEBUG}getFunctions`);

    const data = DBService.db.prepare(GET_ALL_FUNCTIONS).all();
  };

  static processCompareData = (
    rawData: dataObjectCompare[]
  ): dataObjectCompare[] => {
    const map = new Map<
      string,
      { r1?: dataObjectCompare; r2?: dataObjectCompare }
    >();

    for (const row of rawData) {
      const entry = map.get(row.file) ?? {};
      if (row.report === '1') {
        entry.r1 = row;
      } else {
        entry.r2 = row;
      }
      map.set(row.file, entry);
    }

    const result: dataObjectCompare[] = [];

    for (const { r1, r2 } of map.values()) {
      if (r1 && !r2) {
        result.push({ ...r1, status: 'D' });
      } else if (!r1 && r2) {
        result.push({ ...r2, status: 'N' });
      } else if (r1 && r2) {
        result.push({
          ...r2,
          complexityChange: r2.complexity - r1.complexity,
          functionTotalChange: r2.functionTotal - r1.functionTotal,
          complexityTotalChange: r2.complexityTotal - r1.complexityTotal,
          complexityAverageChange: r2.complexityAverage - r1.complexityAverage,
          status: '',
        });
      }
    }

    return result;
  };

  static compareReports = async (
    reportId1: number | bigint,
    reportId2: number | bigint
  ): Promise<any> => {
    log.info_lv2(`${DEBUG}compareReports - ${reportId1} : ${reportId2}`);

    const fileData = DBService.db
      .prepare(GET_COMPARE_REPORT_FILES)
      .all(reportId1, reportId2) as IFiles[];

    const data: dataObjectCompare[] = [];

    fileData.forEach((item) => {
      const tmpData: dataObjectCompare = {
        file: item.filename,
        complexity: item.fileComplexity,
        functionTotal: item.totalFunctions,
        complexityTotal: item.totalComplexity,
        complexityAverage: item.averageComplexity,
        complexityChange: 0,
        functionTotalChange: 0,
        complexityTotalChange: 0,
        complexityAverageChange: 0,
        report: item.report,
        status: '',
      };

      data.push(tmpData);
    });

    return data;
  };

  static getReportById = async (reportId: number | bigint): Promise<any> => {
    log.info_lv2(`${DEBUG}getReportById - ${reportId}`);

    const fileData = DBService.db
      .prepare(GET_ALL_REPORT_FILES)
      .all(reportId) as IFiles[];
    const data: dataObject[] = [];

    fileData.forEach((item) => {
      const tmpData: dataObject = {
        file: item.filename,
        complexity: item.fileComplexity,
        functions: [],
        functionTotal: item.totalFunctions,
        complexityTotal: item.totalComplexity,
        complexityAverage: item.averageComplexity,
      };

      const functionData = DBService.db
        .prepare(GET_ALL_REPORT_FILE_FUNCTIONS)
        .all(reportId, item.id) as IFunctions[];

      functionData.forEach((itemFunction) => {
        const tmpFunction: functionObject = {
          name: itemFunction.function,
          line: itemFunction.line,
          complexity: itemFunction.functionComplexity,
        };

        tmpData.functions.push(tmpFunction);
      });

      data.push(tmpData);
    });

    return data;
  };
}

export default DBRead;
