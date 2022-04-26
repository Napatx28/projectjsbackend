import { Router } from 'express'
import { userModel } from '../models/user.js'
import { body } from 'express-validator'
import * as hashTool from '../utils/hash.js'
import logger from 'node-color-log'
import multer from 'multer'
import { extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { guardMiddleware } from '../middleware/guard.js'
import * as path from 'path'
import { createReadStream } from 'fs'
import { userPictureModel } from '../models/user-picture.js'
import { lookup as mimeLookup } from 'mime-types'

const router = Router()
const PHOTO_PATH = path.join(process.cwd(), '/public/images/')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PHOTO_PATH)
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname)
    userPictureModel.create(
      {
        extname: ext,
      },
      (err, picture) => cb(err ?? null, `${picture._id}${ext}`)
    )
  },
})

const upload = multer({ storage })

router.post(
  '/profile-picture',
  upload.single('profilePicture'),
  async (req, res) => {
    const picture = path.parse(req.file.filename)
    res.send(picture)
  }
)

router.post(
  '/',
  body('id').isString(),
  body('username').isString(),
  body('password').isString().isLength({ min: 4 }),
  body('prefix').isString(),
  body('firstName').isString(),
  body('lastName').isString(),
  body('faculty').isString(),
  body('department').isString(),
  body('address').isString(),
  body('email').isEmail(),
  body('tel').isMobilePhone(),
  body('role').isIn(['admin', 'user']).default('user'),
  body('gender').isIn(['ชาย', 'หญิง']),
  body('profilePicture').optional({ nullable: true }).isUUID(4),
  async (req, res) => {
    try {
      const { id: _id, password, profilePicture, ...payload } = req.body

      const hashedPassword = await hashTool.hash(password)
      const user = await userModel.create({
        _id,
        password: hashedPassword,
        ...payload,
      })

      if (profilePicture) {
        await userPictureModel
          .updateOne(
            {
              _id: profilePicture,
            },
            {
              user: user._id,
            },
            {
              new: true,
            }
          )
          .exec()
      }

      delete user.password
      res.json(user)
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
  guardMiddleware('admin', 'user'),
  body('username').optional({ nullable: true }).isString(),
  body('password').optional({ nullable: true }).isString().isLength({ min: 4 }),
  body('prefix').optional({ nullable: true }).isString(),
  body('firstName').optional({ nullable: true }).isString(),
  body('lastName').optional({ nullable: true }).isString(),
  body('faculty').optional({ nullable: true }).isString(),
  body('department').optional({ nullable: true }).isString(),
  body('address').optional({ nullable: true }).isString(),
  body('email').optional({ nullable: true }).isEmail(),
  body('tel').optional({ nullable: true }).isMobilePhone(),
  body('role').optional({ nullable: true }).isIn(['admin', 'user']),
  body('gender').optional({ nullable: true }).isIn(['ชาย', 'หญิง']),
  body('profilePicture').optional({ nullable: true }).isUUID(4),
  async (req, res) => {
    const { id } = req.user
    const { profilePicture, ...updateFields } = req.body
    if (updateFields.password) {
      updateFields.password = await hashTool.hash(updateFields.password)
    }

    try {
      const user = await userModel
        .updateOne(
          { _id: id },
          {
            ...updateFields,
          },
          { new: true }
        )
        .populate('picture')
        .exec()

      const userPicture = user.picture

      if (profilePicture) {
        if (userPicture) {
          await userPictureModel.findByIdAndDelete(userPicture._id)
        }

        await userPictureModel
          .findByIdAndUpdate(
            profilePicture,
            {
              user: id,
            },
            {
              new: true,
            }
          )
          .exec()
      }

      delete user.picture
      delete user.password

      res.json(user)
    } catch (e) {
      logger.color('red').error(e.stack)
      res.status(500).json({
        error: e.message,
      })
    }
  }
)

router.get('/', async (req, res) => {
  try {
    const { id } = req.query
    const user = await userModel.findById(id).exec()
    delete user.password
    res.json(user)
  } catch (e) {
    logger.color('red').error(e.stack)
    res.status(500).json({
      error: e.message,
    })
  }
})

router.get('/all', guardMiddleware('admin'), async (req, res) => {
  try {
    const users = await userModel
      .find({ $or: [{ role: 'user' }, { _id: req.user.id }] })
      .exec()
    res.json(users)
  } catch (e) {
    logger.color('red').error(e.stack)
    res.status(500).json({
      error: e.message,
    })
  }
})

router.get(
  '/profile-picture',
  guardMiddleware('user', 'admin'),
  async (req, res) => {
    const { id } = req.user
    const user = await userModel.findById(id).populate('picture').exec()
    const pictureDoc = user.picture
    if (!pictureDoc) {
      res.send(null)
      return
    }
    const stream = createReadStream(
      path.join(
        process.cwd(),
        '/public/images/',
        pictureDoc._id + pictureDoc.extname
      )
    )

    res.set({
      'Content-Type': mimeLookup(pictureDoc.extname),
      'Content-Disposition': `attachment; filename="${pictureDoc._id}${pictureDoc.extname}"`,
    })

    stream.pipe(res)
  }
)

export default router
