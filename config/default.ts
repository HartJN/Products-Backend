import dotenv from 'dotenv'
dotenv.config()

export default {
  port: process.env.PORT,
  dbUri: process.env.DB_URI,
  saltWorkFactor: process.env.SALT_ROUNDS,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL,
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
}
