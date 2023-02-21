import config from 'config';

import connect from './utils/connect';
import logger from './utils/logger';
import routes from './routes';
import createServer from './utils/server';
import swaggerDocs from './utils/swagger';

const app = createServer();

const port = config.get<number>('port');

app.listen(port, async () => {
  logger.info(`Server is running on port ${port}`);

  await connect();

  routes(app);

  swaggerDocs(app, port);
});
