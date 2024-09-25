import { ValidationChain, body } from "express-validator";
import asyncHandler from 'express-async-handler'
import passport from "passport";
import { RequestHandler } from "express";

export const controller: {
  render: RequestHandler,
  validate: ValidationChain[],
  submit: RequestHandler
} = {
  render: asyncHandler(async (req, res) => {
    const loginUsernamePrefill = req.flash('loginUsernamePrefill')
    return res.render('layout', {
      page: 'login',
      title: 'Log In',
      prevForm: {
        ...req.body,
        username: loginUsernamePrefill ?? req.body.username
      },
      formErrors: req.formErrors
    })
  }),

  validate: [
    body('username')
      .trim()
      .notEmpty().withMessage('Please enter a username.')
      .escape(),
    body('password')
      .trim()
      .notEmpty().withMessage('Please enter a password.')
      .escape()
  ],

  submit: asyncHandler(async (req, res, next) => {
    if (req.formErrors) return controller.render(req, res, next)
    passport.authenticate('local', (err: Error, user: Express.User) => {
      if (err) return next(err)
      if (!user) {
        req.formErrors = { username: 'Incorrect username or password.' }
        return controller.render(req, res, next)
      } else req.logIn(user, (err) => {
        if (err) return next(err)
        return res.redirect('/')
      })
    })(req, res, next)
  })
}