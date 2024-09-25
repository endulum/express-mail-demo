import dotenv from 'dotenv';
dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.' + process.env.ENV })

import './config/passport';
import path from 'path';
import flash from 'connect-flash';
import express from 'express';
import session from 'express-session';
import asyncHandler from 'express-async-handler'
import passport from 'passport';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';

import logSession from './src/middleware/logSession';
import errorHandler from './src/middleware/errorHandler';
import { router as authRouter } from './src/routes/authRouter';
import { router as mainRouter } from './src/routes/mainRouter'

const secret: string | undefined = process.env.SECRET
if (secret === undefined) throw new Error('Secret is not defined.')

const app = express()

app.set('views', path.join(__dirname, 'src/views'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret,
  resave: false,
  saveUninitialized: true,
  store: new PrismaSessionStore(
    new PrismaClient(),
    {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined
    }
  ),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use(asyncHandler(async (req, res, next) => {
  res.locals.user = req.user
  res.locals.warning = req.flash('warning')
  res.locals.success = req.flash('success')
  if (req.user) return mainRouter(req, res, next)
  else return authRouter(req, res, next)
}))

app.use(errorHandler)

app.listen(3000)