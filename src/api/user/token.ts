import express from 'express';
import { query, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { IUserJWTPayload } from '../../realtime-middlewares/authenticate';
import { IVerificationKey } from './sendLoginEmail';

const app = express.Router();

const generateUserToken = (key: string, username: string): boolean | string => {
  if (process.env.NODE_ENV === 'test') {
    return 'TEST_TOKEN'
  };
  // validate key
  let decoded;
  try {
    decoded = jwt.verify(key, process.env.JWT_SECRET!, {
      audience: process.env.JWT_AUD,
    });

    const verificationKey = <IVerificationKey>decoded;
    // generate user token
    const tokenPayload: IUserJWTPayload = {
      sub: verificationKey.sub,
      name: username,
      role: 'normal',
    };
    return jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      audience: process.env.JWT_AUD,
      expiresIn: '2w',
    });
  } catch {
    return false;
  }
};

/**
 * This endpoint will replace a key sent via email with a long-lived token
 * for service authentication.
 */
app.get(
  '/token',
  query('key').notEmpty().withMessage('Key is required.'),
  query('username').notEmpty().withMessage('Username cannot be empty.'),
  (req, res) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: errors.array({ onlyFirstError: true })[0].msg });
    }
    const token = generateUserToken(req.query!.key, req.query!.username);
    if (!token) {
      return res.json({ error: 'invalid key' });
    }
    return res.json({ token });
  }
);

export default app;
