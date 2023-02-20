import { CookieOptions, Request, Response } from 'express';
import config from 'config';
import jwt from 'jsonwebtoken';

import logger from '../utils/logger';
import { signJwt } from '../utils/jwt.utils';
import {
  findAndUpdateUser,
  getGoogleOAuthTokens,
  getGoogleUser,
  validatePassword,
} from '../service/user.service';
import {
  createSession,
  findSessions,
  updateSession,
} from '../service/session.service';

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000,
  httpOnly: true,
  domain: 'localhost',
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production' ? true : false,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10,
};

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

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

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

export async function googleOAuthHandler(req: Request, res: Response) {
  try {
    //get code from query string
    const code = req.query.code as string;

    const { id_token, access_token } = await getGoogleOAuthTokens({ code });

    //get the id and access token with the code

    // get the user with tokens

    // const googleUser = jwt.decode(id_token);
    const googleUser = await getGoogleUser({ id_token, access_token });

    if (!googleUser.verified_email) {
      return res.status(403).send('Google email not verified');
    }

    // upsert the user

    const user = await findAndUpdateUser(
      { email: googleUser.email },
      {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
      { upsert: true, new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    // create a session

    const session = await createSession(user._id, req.get('user-agent') || '');

    const accessToken = signJwt(
      Object.assign({}, user.toJSON(), { session: session._id }),
      { expiresIn: config.get('accessTokenTtl') }
    );

    const refreshToken = signJwt(
      Object.assign({}, user.toJSON(), { session: session._id }),
      { expiresIn: config.get('refreshTokenTtl') }
    );

    // create an access  and refresh token

    // set cookie

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    // redirect to the client}
    res.redirect(config.get('origin'));
  } catch (err) {
    logger.error(err);
    return res.redirect(`${config.get('origin')}/oauth/error`);
  }
}
