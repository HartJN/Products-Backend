import config from 'config';

import connect from './utils/connect';
import logger from './utils/logger';
import createServer from './utils/server';

const port = config.get<number>('port');

const app = createServer();

app.listen(port, async () => {
  logger.info(`Server is running on port ${port}`);

  await connect();
});
