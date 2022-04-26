import { Router } from 'express'
import logger from 'node-color-log'
import { guardMiddleware } from '../middleware/guard.js'
import { bookModel } from '../models/book.js'
import { body } from 'express-validator'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { id } = req.query
    const book = await bookModel.findById(id).exec()
    res.json(book)
  } catch (e) {
    logger.color('red').error(e.stack)
    res.status(500).json({
      error: e.message,
    })
  }
})

router.get('/all', async (req, res) => {
  const books = await bookModel.find().exec()
  res.json(books)
})

router.get('/avaliable', async (req, res) => {
  const books = await bookModel
    .find({
      book_type: {
        $in: ['หนังสือ', 'ซีดี', 'หนังสือจอง'],
      },
    })
    .populate({
      path: 'transactions',
      match: { returned_date: null },
    })
    .exec()

  res.json(books.filter((book) => book.transactions.length === 0))
})

router.post(
  '/',
  guardMiddleware('admin'),
  body('title').isString(),
  body('author').isString(),
  body('publisher').isString(),
  body('category').isString(),
  body('price').isNumeric(),
  body('bookType').isString(),
  async (req, res) => {
    try {
      const { title, author, publisher, category, price, bookType } = req.body
      const book = await bookModel.create({
        bookType,
        title,
        author,
        publisher,
        category,
        price,
      })
      res.json(book)
    } catch (err) {
      logger.color('red').error(err.stack)
      res.status(500).json({
        error: err.message,
      })
    }
  }
)

router.put(
  '/',
  guardMiddleware('admin'),
  body('id').isString(),
  body('title').optional({ nullable: true }).isString(),
  body('author').optional({ nullable: true }).isString(),
  body('publisher').optional({ nullable: true }).isString(),
  body('category').optional({ nullable: true }).isString(),
  body('price').optional({ nullable: true }).isNumeric(),
  async (req, res) => {
    try {
      const { id, ...updateField } = req.body
      const book = await bookModel.findByIdAndUpdate(id, updateField).exec()
      res.json(book)
    } catch (err) {
      logger.color('red').error(err.stack)
      res.status(500).json({
        error: err.message,
      })
    }
  }
)

router.delete('/', guardMiddleware('admin'), async (req, res) => {
  try {
    const { id } = req.query
    const book = await bookModel.findByIdAndDelete(id).exec()
    res.json(book)
  } catch (err) {
    logger.color('red').error(err.stack)
    res.status(500).json({
      error: err.message,
    })
  }
})

export default router
