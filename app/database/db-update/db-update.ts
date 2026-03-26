import { log } from '../../utility/logger.ts';
import DBService from '../../services/db.service.ts';
import {
  IFiles,
  IFunctions,
  IReports,
} from '../../interface/report-data.interface.ts';
import {
  CREATE_FILE_DATA,
  CREATE_FUNCTION_DATA,
  CREATE_REPORT_DATA,
  UPDATE_REPORT_DATA,
} from './sql-update.ts';

const DEBUG = 'db-update | ';

class DBUpdate {

  static updateReports = async (): Promise<void> => {
    log.info_lv2(`${DEBUG}updateReports`);
    await DBService.db.prepare(UPDATE_REPORT_DATA).run();
  };

  static createReports = async (data: IReports): Promise<number | bigint> => {
    log.info_lv2(`${DEBUG}createReports`);
    const result = await DBService.db.prepare(CREATE_REPORT_DATA).run(data.report);

    const priKey = result.lastInsertRowid;

    return priKey
  };

  static createFiles = async (data: IFiles): Promise<number | bigint> => {
    log.info_lv2(`${DEBUG}createFiles`);
    const result = await DBService.db
      .prepare(CREATE_FILE_DATA)
      .run(
        data.report_id,
        data.filename,
        data.fileComplexity,
        data.totalFunctions,
        data.totalComplexity,
        data.averageComplexity
      );

    const priKey = result.lastInsertRowid;

    return priKey
  };

  static createFunctions = async (data: IFunctions): Promise<number | bigint> => {
    log.info_lv2(`${DEBUG}createFunctions`);
    const result = await DBService.db
      .prepare(CREATE_FUNCTION_DATA)
      .run(
        data.report_id,
        data.summary_id,
        data.function,
        data.line,
        data.functionComplexity
      );
      const priKey = result.lastInsertRowid;

      return priKey
  };
}

export default DBUpdate;
