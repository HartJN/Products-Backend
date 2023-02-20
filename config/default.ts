import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT,
  origin: process.env.ORIGIN_URL,
  dbUri: process.env.DB_URI,
  saltWorkFactor: process.env.SALT_ROUNDS,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL,
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  googleClientId: process.env.AUTHO_CLIENT_ID,
  googleClientSecret: process.env.AUTHO_SECRET,
  googleOAuthRedirectUri: process.env.AUTHO_REDIRECT_URL,
};
