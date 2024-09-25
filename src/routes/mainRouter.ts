import express from 'express'
import asyncHandler from 'express-async-handler'
import handleValidationErrors from '../middleware/handleValidationErrors'

import { controller as account } from '../controllers/account'

const router = express.Router()

router.route('/')
  .get(asyncHandler(async (req, res) => {
    return res.render('layout', {
      page: 'index',
      title: 'Index'
    })
  }))

router.route('/account')
  .get(account.render)
  .post(account.validate, handleValidationErrors, account.submit)

router.route('/logout')
  .get(asyncHandler(async (req, res, next) => {
    req.logOut((err) => {
      if (err) return next(err);
      req.flash('success', 'You have been logged out.')
      return res.redirect('/login')
    })
  }))

router.route('*')
  .all(asyncHandler(async (req, res) => res.redirect('/')))

export { router }