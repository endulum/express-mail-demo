import express from 'express'
import asyncHandler from 'express-async-handler'
import handleValidationErrors from '../middleware/handleValidationErrors'

import { controller as login } from '../controllers/login'
import { controller as signup } from '../controllers/signup'

const router = express.Router()

router.route('/login')
  .get(login.render)
  .post(login.validate, handleValidationErrors, login.submit)

router.route('/signup')
  .get(signup.render)
  .post(signup.validate, handleValidationErrors, signup.submit)

router.route('*')
  .all(asyncHandler(async (req, res) => res.redirect('/login')))

export { router }