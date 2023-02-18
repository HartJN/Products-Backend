import jwt from 'jsonwebtoken'
import config from 'config'

const privateKey = config.get<string>('privateKey')
console.log(privateKey)
const publicKey = config.get<string>('publicKey')
console.log(publicKey)

export function signJwt(object: Object, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: 'RS256',
  })
}

export function verifyJwt(token: string) {
  try {
    const decoded = jwt.verify(token, publicKey)
    return {
      valid: true,
      expired: false,
      decoded,
    }
  } catch (err: any) {
    return {
      valid: false,
      expired: err.message === 'jwt expired',
      decoded: null,
    }
  }
}
