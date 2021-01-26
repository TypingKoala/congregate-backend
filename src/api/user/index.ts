import express from 'express';
import sendLoginEmail from './sendLoginEmail'
import token from './token'
import userInfo from './userInfo'

const app = express.Router();

// passport bearer token
import passport from 'passport';
import Jwt from 'passport-jwt';
import User, { IUserModel } from '../../models/User';
const JwtStrategy = Jwt.Strategy;
const ExtractJwt = Jwt.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  audience: process.env.JWT_AUD
}
passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  User.findOne({ email: jwt_payload.sub }, (err: any, user: IUserModel) => {
    if (err) return done(err, false);
    if (user) return done(null, user);
    return done(null, false);
  })
}))

app.use(passport.initialize());
app.use(sendLoginEmail);
app.use(token);
app.use(userInfo);

module.exports = app;
