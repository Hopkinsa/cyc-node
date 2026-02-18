import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import * as path from 'path';

const CONFIG_PATH = './app/config.json';

let config = {
  SERVER_PORT: null,
  REPORT_BASE_PATH: '',
  REPORTS: [],
};

if (existsSync(CONFIG_PATH)) {
  const configFile = await readFile(CONFIG_PATH, 'utf8');
  config = JSON.parse(configFile);

  // Generate a full path to the reporting directory
  config.REPORT_BASE_PATH = path.resolve('./reporting');
}

export default config;
