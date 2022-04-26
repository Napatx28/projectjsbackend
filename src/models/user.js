import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { toBuffer, toString } from 'uuid-buffer'

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  prefix: { type: String, required: true },
  first_name: { type: String, required: true, alias: 'firstName' },
  last_name: { type: String, alias: 'lastName' },
  faculty: { type: String, required: true },
  department: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  tel: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user',
  },
  gender: { type: String, required: true, enum: ['ชาย', 'หญิง'] },
  job: {
    type: String,
    required: true,
    enum: ['ครู', 'นักเรียน', 'เจ้าหน้าที่', 'บุคคลภายนอก'],
    default: 'บุคคลภายนอก',
  },
})

userSchema.virtual('picture', {
  ref: 'user_pictures',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
})

export const userModel = mongoose.model('users', userSchema)
