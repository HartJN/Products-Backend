import express from 'express';
import deserialiseUser from '../middleware/deserialiseUser';
import routes from '../routes';

function createServer() {
  const app = express();

  app.use(express.json());

  app.use(deserialiseUser);

  routes(app);

  return app;
}

export default createServer;
