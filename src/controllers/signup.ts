import { ValidationChain, body } from "express-validator";
import asyncHandler from 'express-async-handler'
import { RequestHandler } from "express";
import bcrypt from 'bcryptjs'

import usernameValidation from '../common/usernameValidation'
import prisma from "../prisma";

export const controller: {
  render: RequestHandler,
  validate: ValidationChain[],
  submit: RequestHandler
} = {
  render: asyncHandler(async (req, res) => {
    return res.render('layout', {
      page: 'signup',
      title: 'Sign Up',
      prevForm: req.body,
      formErrors: req.formErrors
    })
  }),

  validate: [
    usernameValidation,
    body('password')
      .trim()
      .notEmpty().withMessage('Please enter a password.').bail()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
      .escape(),

    body('confirmPassword')
      .trim()
      .notEmpty().withMessage('Please confirm your password.').bail()
      .custom(async (value, { req }) => {
        if (value !== req.body.password) throw new Error('Both passwords do not match.')
      })
      .escape()
  ],

  submit: asyncHandler(async (req, res, next) => {
    if (req.formErrors) return controller.render(req, res, next)
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) throw new Error(err.message)
      await prisma.user.create({
        data: {
          username: req.body.username,
          password: hashedPassword
        }
      })
    })
    req.flash('success', 'Your account has been created. Please proceed to log in to your new account.')
    req.flash('loginUsernamePrefill', req.body.username)
    return res.redirect('/login')
  })
}

export default controller