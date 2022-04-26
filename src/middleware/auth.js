import logger from 'node-color-log'
import { accessToken } from '../utils/access-token.js'

const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    next()
    return
  }

  const bearerPattern = /Bearer (.+)/
  const token = bearerPattern.exec(authorization)[1]

  if (!token) {
    next()
    return
  }

  try {
    const decoded = await accessToken.verify(token)
    req.user = decoded
    next()
  } catch (e) {
    logger.color('red').error(e.stack)
    next()
    return
  }
}

export default authMiddleware
