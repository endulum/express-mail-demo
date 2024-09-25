import nodemailer from 'nodemailer'

if (
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS
) throw new Error('SMTP credentials are not defined.')

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export default transporter;