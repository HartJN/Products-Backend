import { Request, Response } from 'express';
import config from 'config';

import logger from '../utils/logger';
import { signJwt } from '../utils/jwt.utils';
import { validatePassword } from '../service/user.service';
import {
  createSession,
  findSessions,
  updateSession,
} from '../service/session.service';

export async function createUserSessionHandler(req: Request, res: Response) {
  try {
    const user = await validatePassword(req.body);

    if (!user) {
      return res.status(401).send('Invalid username or password');
    }

    const session = await createSession(user._id, req.get('user-agent') || '');

    const accessToken = signJwt(
      { ...user, session: session._id },
      { expiresIn: config.get('accessTokenTtl') }
    );

    const refreshToken = signJwt(
      { ...user, session: session._id },
      { expiresIn: config.get('refreshTokenTtl') }
    );

    res.cookie('accessToken', accessToken, {
      maxAge: 900000,
      httpOnly: true,
      domain: 'localhost',
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production' ? true : false,
    });

    res.cookie('refreshToken', refreshToken, {
      maxAge: 3.154e10,
      httpOnly: true,
      domain: 'localhost',
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production' ? true : false,
    });

    return res.send({ accessToken, refreshToken });
  } catch (err: any) {
    logger.error(err);
    return res.status(409).send(err.message);
  }
}

export async function getUserSessionsHandler(req: Request, res: Response) {
  const userId = res.locals.user._id;
  const sessions = await findSessions({ user: userId, valid: true });

  return res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session;

  await updateSession({ _id: sessionId }, { valid: false });

  return res.send({
    accessToken: null,
    refreshToken: null,
  });
}
