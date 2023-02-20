import express from 'express';
import cookieParser from 'cookie-parser';
import deserialiseUser from '../middleware/deserialiseUser';
import routes from '../routes';
import cors from 'cors';
import config from 'config';

function createServer() {
  const app = express();

  app.use(
    cors({
      origin: config.get('origin'),
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());
  app.use(deserialiseUser);

  routes(app);

  return app;
}

export default createServer;
