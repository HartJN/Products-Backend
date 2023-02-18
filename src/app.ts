import express from 'express';
import config from 'config';
import connect from './utils/connect';
import logger from './utils/logger';
import routes from './routes';
import deserialiseUser from './middleware/deserialiseUser';

const port = config.get<number>('port');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(deserialiseUser);

app.listen(port, async () => {
  logger.info(`Server is running on port ${port}`);

  await connect();

  routes(app);
});
