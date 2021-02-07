import { Socket } from 'socket.io';
import winston from 'winston';
import jwt from 'jsonwebtoken';

import User, { IUserModel } from '../models/User';

require('../logger');
const logger = winston.loggers.get('server');

export interface IUserJWTPayload {
  sub: string; // email address
  name: string;
  role: 'admin' | 'normal' | 'anonymous';
}

const isUserJWTPayload = (obj: any) => {
  try {
    return (
      typeof obj.sub === 'string' &&
      (obj.role === 'admin' ||
        obj.role === 'normal' ||
        obj.role === 'anonymous')
    );
  } catch {
    return false;
  }
};

interface ISocketAuth {
  token: string;
}

export interface ISocketAuthenticated extends Socket {
  user: IUserJWTPayload;
  dbUser: IUserModel;
}

/**
 * This middleware will authenticate socket.io connections by checking
 * if the token is provided. If it is not, then the connection must be a
 * matchmaking game.
 *
 * @param socket
 * @param next
 */
export const authenticateConnection = (socket: Socket, next: any) => {
  if (!('token' in socket.handshake.auth)) {
    // if token isn't provided
    logger.warn('Auth token not provided in connection.', { id: socket.id });
    // if attempting to start private game, then raise connection error
    logger.info(
      'Failing because unauthenticated user is trying to join private session',
      { id: socket.id }
    );
    const err = new Error('Authentication failed.');
    return next(err);
  } else {
    // extract and verify token
    const auth = <ISocketAuth>socket.handshake.auth;
    const token = auth.token;

    // if dev environment, perform mock verification
    if (process.env.NODE_ENV === 'test' && token === 'TEST_TOKEN') {
      return next();
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || '',
      {
        audience: process.env.JWT_AUD,
      },
      (err, decoded) => {
        // handle verification error
        if (err) {
          logger.error(err);
          logger.warn('Token verification failed', { token });
          return next(new Error('Authentication failed.'));
        }

        // verify correct payload format
        if (!isUserJWTPayload(decoded)) {
          logger.warn('Invalid token payload', { decoded });
          const err = new Error('Authentication failed.');
          return next(err);
        }

        const userJWTPayload = <IUserJWTPayload>decoded;

        // success
        (<ISocketAuthenticated>socket).user = <IUserJWTPayload>decoded;

        // find user in database if not anonymous
        if (userJWTPayload.role !== 'anonymous') {
          User.findOne(
            { email: userJWTPayload.sub },
            (err: any, user: IUserModel) => {
              if (err) logger.error(err);
              if (!user) {
                logger.warn('Unable to find user');
                return next(new Error('Unable to find user'));
              }

              (<ISocketAuthenticated>socket).dbUser = user;
              next();
            }
          );
        } else {
          next();
        }
      }
    );
  }
};
