import express from 'express'
import asyncHandler from 'express-async-handler'
import handleValidationErrors from '../middleware/handleValidationErrors'
import { RequestHandler } from 'express-serve-static-core'
import { body, ValidationChain } from 'express-validator'
import ejs from 'ejs'
import path from 'path'

import transporter from '../nodemailer'

const router = express.Router()

const email: {
  render: RequestHandler,
  validate: ValidationChain[],
  submit: RequestHandler
} = {
  render: asyncHandler(async (req, res) => {
    return res.render('layout', {
      page: 'send-email-form',
      title: 'Send an Email',
      prevForm: req.body,
      formErrors: req.formErrors,
    })
  }),

  validate: [
    body('email')
      .trim()
      .notEmpty().withMessage('Please input an email.')
      .isEmail().withMessage('Not a valid email.')
      .escape(),
    body('message')
      .trim()
      .escape()
  ],

  submit: asyncHandler(async (req, res, next) => {
    if (req.formErrors) return email.render(req, res, next);
    // begin email
    if (!process.env.SMTP_EMAIL)
      throw new Error('Sendee is not defined.');

    try {
      const htmlPath = path.join(__dirname, '..', '..', '/src/views/mail.ejs')
      const html = await ejs.renderFile(htmlPath, {
        message: req.body.message
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: req.body.email,
        subject: 'Does this work?',
        html
      })
    } catch(err) {
      console.error(err);
      return email.render(req, res, next);
    }

    // end email
    return res.redirect('/success')
  })
}

router.route('/')
  .get(asyncHandler(async (req, res) => {
    return res.redirect('/email')
  }))

router.route('/email')
  .get(email.render)
  .post(email.validate, handleValidationErrors, email.submit)

router.route('/success')
  .get(asyncHandler(async (req, res) => {
    return res.render('layout', {
      page: 'send-email-success',
      title: 'Successfully sent email'
    })
  }))

  export default router;