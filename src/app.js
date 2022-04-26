import cookieParser from 'cookie-parser'
import express from 'express'
import userRoute from './routes/user.js'
import authRoute from './routes/auth.js'
import authMiddleware from './middleware/auth.js'
import bookRoute from './routes/book.js'
import bookTransactionRoute from './routes/book-transaction.js'
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:8080'],
  })
)
app.use(authMiddleware)

app.use('/user', userRoute)
app.use('/auth', authRoute)
app.use('/book', bookRoute)
app.use('/book-transaction', bookTransactionRoute)

app.get('/', (req, res) => {
  res.send('Hello World')
})

export default app
