import express from 'express';
import { query, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { ServerLogger } from '../../logger';
import User, { IUserModel } from '../../models/User';
import { IUserJWTPayload } from '../../realtime-middlewares/authenticate';
import { IVerificationKey } from './sendLoginEmail';

const app = express.Router();

app.get(
  '/token',
  query('key').notEmpty().withMessage('Key is required.'),
  (req, res, next) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: errors.array({ onlyFirstError: true })[0].msg });
    }

    // validate key
    let decoded;
    try {
      decoded = jwt.verify(req.query!.key, process.env.JWT_SECRET!, {
        audience: process.env.JWT_AUD,
      });

      const verificationKey = <IVerificationKey>decoded;

      // check if user is in database
      User.findOne(
        { email: verificationKey.sub },
        (err: any, user: IUserModel) => {
          if (err) return next(err);
          if (user) {
            // get and return a token for the user
            // generate user token
            const tokenPayload: IUserJWTPayload = {
              sub: user.email,
              name: user.username,
              role: 'normal',
            };
            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
              audience: process.env.JWT_AUD,
              expiresIn: '2w',
            });

            return res.json({ registered: true, token });
          } else {
            // no user
            return res.json({ registered: false });
          }
        }
      );
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * This endpoint will replace a key sent via email with a long-lived token
 * for service authentication.
 */
app.get(
  '/register',
  query('key').notEmpty().withMessage('Key is required.'),
  query('username').notEmpty().withMessage('Username cannot be empty.'),
  (req, res, next) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: errors.array({ onlyFirstError: true })[0].msg });
    }

    // validate key
    let decoded;
    try {
      decoded = jwt.verify(req.query!.key, process.env.JWT_SECRET!, {
        audience: process.env.JWT_AUD,
      });

      const verificationKey = <IVerificationKey>decoded;
      // generate user token
      const tokenPayload: IUserJWTPayload = {
        sub: verificationKey.sub,
        name: req.query!.username,
        role: 'normal',
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
        audience: process.env.JWT_AUD,
        expiresIn: '2w',
      });
      // create user in database
      if (process.env.NODE_ENV !== 'test') {
        const newUser = new User({
          email: verificationKey.sub,
          username: req.query!.username,
        });
        newUser.save((err, user) => {
          if (err) return next(err);
          return res.json({ token })
        });
      } else {
        // skip database insert in test mode
        return res.json({ token });
      }
    } catch {
      return res.json({ error: 'invalid key' });
    }
  }
);

export default app;
