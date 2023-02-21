import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from 'config';

import routes from '../routes';
import deserialiseUser from '../middleware/deserialiseUser';

function createServer() {
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

  routes(app);

  return app;
}

export default createServer;
