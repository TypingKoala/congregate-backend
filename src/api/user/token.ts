import express from 'express';
import { query, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BooleanLiteral } from 'typescript';
import User from '../../models/User';
import { IUserJWTPayload } from '../../realtime-middlewares/authenticate';
import { IVerificationKey } from './sendLoginEmail';

const app = express.Router();

interface IUserToken {
  success: boolean
  token?: string
  payload?: IUserJWTPayload
}

const generateUserToken = (key: string, username: string): IUserToken => {
  if (process.env.NODE_ENV === 'test') {
    return {
      success: true,
      token: 'TEST_TOKEN',
      payload: {
        sub: 'test@test.com',
        name: 'test',
        role: 'normal'
      }
    }
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
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      audience: process.env.JWT_AUD,
      expiresIn: '2w',
    });

    return {
      success: true,
      token,
      payload: tokenPayload
    }
  } catch {
    return { success: false };
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

    const result = generateUserToken(req.query!.key, req.query!.username);
    if (!result.success) {
      return res.json({ error: 'invalid key' });
    }

    // create user in database
    if (process.env.NODE_ENV !== 'test') {
      User.create({
        email: result.payload?.sub,
        username: req.query!.username
      })  
    }

    return res.json({ token: result.token });
  }
);

export default app;
