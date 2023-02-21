import express from 'express';
import config from 'config';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import deserialiseUser from './middleware/deserialiseUser';
import connect from './utils/connect';
import logger from './utils/logger';
import routes from './routes';

const app = express();

app.use(
  cors({
    origin: config.get('origin'),
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(deserialiseUser);

const port = config.get<number>('port');

app.listen(port, async () => {
  logger.info(`Server is running on port ${port}`);

  await connect();

  routes(app);
});
