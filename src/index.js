import app from './app.js'
import http from 'http'
import logger from 'node-color-log'
import mongoose from 'mongoose'
import 'dotenv/config'

async function main() {
  const port = process.env.PORT ?? 4000
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      logger.color('green').log('[MongoDB] connected')
    })
    .catch((e) => {
      logger.color('red').error('[MongoDB] connection error')
      logger.color('red').error(e)
      process.exit(1)
    })

  const server = http.createServer(app)
  server.listen(port, () => {
    logger.color('green').log(`[Server] Server is running on port ${port}`)
  })
}

main()
