import dayjs from 'dayjs'
import { Router } from 'express'
import { body, query } from 'express-validator'
import { accessToken } from '../utils/access-token.js'
import * as hashTool from '../utils/hash.js'
import { userModel } from '../models/user.js'
import jwt from 'jsonwebtoken'
import logger from 'node-color-log'

const router = Router()

router.post(
  '/sign-in',
  body('username').isString(),
  body('password').isString(),
  async (req, res) => {
    try {
      const { username, password } = req.body
      const user = await userModel
        .findOne({ username })
        .populate('picture')
        .exec()
      if (!user) {
        res.status(401).json({
          error: 'Invalid username or password',
        })
        return
      }
      const isValid = await hashTool.compare(password, user.password)
      if (!isValid) {
        res.status(401).json({
          error: 'Invalid username or password',
        })
        return
      }

      delete user.password

      const payload = {
        id: user._id,
        username: user.username,
        prefix: user.prefix,
        firstName: user.firstName,
        lastName: user.lastName,
        faculty: user.faculty,
        department: user.department,
        role: user.role,
        job: user.job,
        picture: user.picture?._id,
      }

      const token = await accessToken.sign(payload)

      res
        .cookie('access_token', token, {
          expires: dayjs().add(8, 'hour').toDate(),
        })
        .json({
          accessToken: token,
          ...payload,
        })
    } catch (err) {
      logger.color('red').error(err.stack)
      res.status(500).json({
        error: err.message,
      })
    }
  }
)

router.post('/sign-out', async (req, res) => {
  try {
    res.clearCookie('access_token')
    res.json({
      message: 'Sign out success',
    })
  } catch (err) {
    res.status(500).json({
      error: err.message,
    })
  }
})

router.get('/verify', query('token').isJWT(), async (req, res) => {
  try {
    res.status(200).json(await accessToken.verify(req.query.token))
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
      })
      return
    }
    res.status(500).json({
      error: err.message,
    })
  }
})

export default router
