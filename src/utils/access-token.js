import jwt from 'jsonwebtoken'
import logger from 'node-color-log'

export class AccessToken {
  constructor(privateKey, publicKey) {
    this.privateKey = privateKey
    this.publicKey = publicKey
  }

  verify(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.publicKey, (err, decoded) => {
        if (err) {
          logger.color('red').error(err.stack)
          reject(err)
        }
        resolve(decoded)
      })
    })
  }

  sign(payload) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.privateKey,
        {
          algorithm: 'ES256',
          expiresIn: '4h',
          issuer: 'libary.io',
        },
        (err, token) => {
          if (err) {
            reject(err)
            return
          }
          resolve(token)
        }
      )
    })
  }
}

const {private_key}= JSON.parse(process.env.JWT_PRIVATE_KEY)
const {public_key}= JSON.parse(process.env.JWT_PUBLIC_KEY) 

export const accessToken = new AccessToken(
  private_key,
  public_key
)
