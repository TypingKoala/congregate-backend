import { body, validationResult } from 'express-validator';

import Handlebars from 'handlebars';
import RedisStore from 'rate-limit-redis';
import { ServerLogger } from '../../logger';
import allowedCallbackURLs from './allowedCallbackURLs';
import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import mg from 'nodemailer-mailgun-transport';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import redis from 'redis';

var client;
if (process.env.NODE_ENV !== 'test') {
  client = redis.createClient({
    url: process.env.REDIS_CONN_STR,
  });
}

const app = express.Router();

const nodemailerMailgun = nodemailer.createTransport(
  mg({
    auth: {
      api_key: process.env.MAILGUN_API_KEY!,
      domain: process.env.MAILGUN_DOMAIN!,
    },
  })
);

export interface IVerificationKey {
  sub: string;
  type: 'verify';
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

const sendLoginLimiter_IP = rateLimit({
  store: (process.env.NODE_ENV !== 'test' && new RedisStore({
    prefix: 'rl-sendLoginEmail-ip:',
    client,
    expiry: 30 * 60,
  })) || undefined,
  windowMs: 30 * 60 * 1000, // 30 minute window
  max: 20, // start blocking after 20 requests
  // @ts-ignore
  message: {
    errors: [
      {
        param: 'rate-limit',
        msg: 'Too many emails have been sent from this IP',
      },
    ],
  },
  statusCode: 200,
  skip: (req, res) => process.env.NODE_ENV === 'test',
});

const sendLoginLimiter_Email = rateLimit({
  store: (process.env.NODE_ENV !== 'test' && new RedisStore({
    prefix: 'rl-sendLoginEmail-email:',
    client,
    expiry: 60 * 60,
  })) || undefined,
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  // @ts-ignore
  message: {
    errors: [
      {
        param: 'email',
        msg: 'Too many emails have been sent to this email.',
      },
    ],
  },
  statusCode: 200,
  keyGenerator: (req, res) => req.body.email,
  skip: (req, res) => process.env.NODE_ENV === 'test',
});

/**
 * This endpoint sends a verification email to the user, which will contain a token
 * that must be used to request a long-lasting token with a username.
 */
app.post(
  '/sendLoginEmail',
  sendLoginLimiter_Email,
  sendLoginLimiter_IP,
  body('email').isEmail().withMessage('Invalid email'),
  body('callbackUrl')
    .notEmpty()
    .custom((value) => {
      // validate that the hostname is allowed
      const url = new URL(value);
      return allowedCallbackURLs.includes(url.hostname);
    })
    .withMessage('Invalid callback URL'),
  (req, res) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array({ onlyFirstError: true }) });
    }
    // create email
    const data = fs.readFileSync('src/api/user/emailTemplate.html', 'utf8');
    const template = Handlebars.compile(data);

    const token = generateVerificationToken(req.body.email);
    const loginURL = `${req.body.callbackUrl}?key=${token}`;
    const html = template({ loginURL });

    if (process.env.NODE_ENV !== 'test') {
      nodemailerMailgun
        .sendMail({
          from: 'Street Skipper No-Reply <no-reply@streetskipper.com>',
          to: req.body.email,
          subject: 'Connect your email address to Street Skipper',
          html,
        })
        .then((_) => {
          res.json({ success: true });
        })
        .catch((err) => {
          ServerLogger.error(err);
          res.json({ error: 'Unable to send email' });
        });
    } else {
      res.json({ success: true });
    }
  }
);

export default app;
