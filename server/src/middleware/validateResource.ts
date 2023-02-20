import { Request, Response, NextFunction } from 'express';
import * as Z from 'zod';

const validate =
  (schema: Z.AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      console.log('hit validateResource');
      return res.status(400).send(err.errors);
    }
  };

export default validate;
