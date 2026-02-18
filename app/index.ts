import { createServer } from 'http';

import config from './utility/config.ts';
import { log } from './utility/logger.ts';
import { app } from './app.ts';

const PORT = config.SERVER_PORT;
const server = createServer(app);

log.info_lv1(`Starting CYC-Node`);
if (PORT !== null) {
  server.listen(PORT, () => {
    log.info_lv2(`Server port: ${PORT}`);
    log.info_lv2(`Web page: http://localhost:${PORT}`);
  });
} else {
  log.error(`Server port not set`);
}
