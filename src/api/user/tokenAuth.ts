import { NextFunction, Request, Response } from 'express';

import passport from 'passport';

export const AuthenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    if (!user) return res.json({ error: 'Invalid token' });

    req.logIn(user, { session: false }, (err) => {
      if (err) return next(err);
      next();
    });
  })(req, res, next);
};
