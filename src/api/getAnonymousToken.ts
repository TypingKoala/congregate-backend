import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { IUserJWTPayload } from './user';

const app = express.Router();

export const generateAnonymousToken = () => {
  const uniqueID = crypto.randomBytes(8).toString('hex');

  const payload: IUserJWTPayload = {
    sub: uniqueID,
    name: 'Anonymous',
    role: 'anonymous',
  };

  return jwt.sign(payload, process.env.JWT_SECRET || '', {
    audience: process.env.JWT_AUD,
  });
};

app.get('/getAnonymousToken', (req, res) => {
  const token = generateAnonymousToken();
  return res.json({ token });
});

export default app;
