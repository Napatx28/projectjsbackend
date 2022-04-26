import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  buy_date: { type: Date, required: false, alias: 'buyDate' },
  book_type: {
    type: String,
    required: true,
    alias: 'bookType',
    enum: [
      'หนังสือ',
      'ซีดี',
      'หนังสือจอง',
      'หนังสือพิมพ์',
      'วารสาร',
      'จุลสาร',
      'หนังสืออ้างอิง',
    ],
  },
})

bookSchema.virtual('transactions', {
  ref: 'book_transactions',
  localField: '_id',
  foreignField: 'book',
})

export const bookModel = mongoose.model('books', bookSchema)
