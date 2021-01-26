import Handlebars from 'handlebars';
import fs from 'fs';
import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import allowedCallbackURLs from './allowedCallbackURLs';

const app = express.Router();

// setup nodemailer
import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import { ServerLogger } from '../../logger';

const nodemailerMailgun = nodemailer.createTransport(
  mg({
    auth: {
      api_key: process.env.MAILGUN_API_KEY!,
      domain: process.env.MAILGUN_DOMAIN!,
    },
  })
);

export interface IVerificationKey {
  sub: string,
  type: 'verify'
}

const generateVerificationToken = (email: string) => {
  const payload: IVerificationKey = {
    sub: email,
    type: 'verify',
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    audience: process.env.JWT_AUD,
    expiresIn: '2h',
  });
};

/**
 * This endpoint sends a verification email to the user, which will contain a token
 * that must be used to request a long-lasting token with a username.
 */
app.post(
  '/sendLoginEmail',
  body('email').isEmail(),
  body('callbackUrl').notEmpty().custom(value => {
    // validate that the hostname is allowed
    const url = new URL(value);
    return allowedCallbackURLs.includes(url.hostname);
  }),
  (req, res) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: 'Invalid email address or callback URL' });
    }

    // create email
    const data = fs.readFileSync('src/api/user/emailTemplate.html', 'utf8');
    const template = Handlebars.compile(data);

    const token = generateVerificationToken(req.body.email);
    const loginURL = `${req.body.callbackUrl}?key=${token}`;
    const html = template({ loginURL });

    if (process.env.NODE_ENV !== 'test') {
      nodemailerMailgun.sendMail({
        from: 'Congregate No-Reply <congregate-no-reply@jbui.me>',
        to: req.body.email,
        subject: 'Connect your email address to Congregate',
        html,
      })
      .then(_ => {
        res.json({ success: true });
      })
      .catch((err) => {
        ServerLogger.error(err);
        res.json({ error: "Unable to send email" })
      })
    } else {
      res.json({ success: true });
    }


  }
);

export default app;
