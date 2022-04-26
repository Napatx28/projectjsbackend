import mongoose from 'mongoose'

import { toString, toBuffer as ogBuffer } from 'uuid-buffer'
import { v4 as uuidv4 } from 'uuid'

function toBuffer(uuid) {
  console.log(uuid)
  if (uuid instanceof Buffer) {
    return uuid
  }

  return ogBuffer(uuid)
}

const UserPictureSchema = new mongoose.Schema({
  _id: {
    type: Buffer,
    subtype: 4,
    get: (_) => (_ ? toString(_) : null),
    set: toBuffer,
    alias: 'profilePicture',
    required: false,
    default: uuidv4,
  },
  user: {
    type: String,
    ref: 'users',
    required: false,
    default: null,
  },
  extname: { type: String, required: true },
})

export const userPictureModel = mongoose.model(
  'user_pictures',
  UserPictureSchema
)
