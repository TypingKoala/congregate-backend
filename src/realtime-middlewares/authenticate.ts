import { Socket } from 'socket.io';
import winston from 'winston';
import jwt from 'jsonwebtoken';

import { IUserJWTPayload, isUserJWTPayload } from '../api/user'

require('../logger');
const logger = winston.loggers.get('server');

interface ISocketAuth {
  token: string;
}

export interface ISocketAuthenticated extends Socket {
  user: IUserJWTPayload;
}

export const authenticateConnection = (socket: Socket, next: any) => {
  if (!('token' in socket.handshake.auth)) {
    // if token isn't provided
    logger.warn('Auth token not provided in connection.', { id: socket.id });
    const err = new Error("Authentication failed.");
    return next(err);
  } else {
    // extract and verify token
    const auth = <ISocketAuth>socket.handshake.auth;
    const token = auth.token;

    // if dev environment, perform mock verification
    if (process.env.NODE_ENV === 'test') {
      if (token === "TEST_TOKEN") {
        return next();
      } else {
        return next(new Error("Invalid test token"));
      }
    }
    
    jwt.verify(token, process.env.JWT_SECRET || "", {
      audience: process.env.JWT_AUD
    }, (err, decoded) => {
      // handle verification error
      if (err) {
        logger.warn('Token verification failed', { token });
        const err = new Error("Authentication failed.");
        return next(err);
      };

      // verify correct payload format
      if (!isUserJWTPayload(decoded)) {
        logger.warn('Invalid token payload', { decoded });
        const err = new Error("Authentication failed.");
        return next(err);
      }

      // success
      (<ISocketAuthenticated>socket).user = <IUserJWTPayload>decoded;
      next();
    })
  }
};
