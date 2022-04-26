import logger from 'node-color-log'

export const errorHandler = (err, req, res, next) => {
  logger.color('red').error(err.stack)
  res.status(500).json({
    error: err.message,
  })
}
