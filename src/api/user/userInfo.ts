import express from 'express';
import { body, validationResult } from 'express-validator';
import User, { IUserModel } from '../../models/User';
import { IUserJWTPayload } from '../../realtime-middlewares/authenticate';
import { AuthenticateToken } from './tokenAuth';
import jwt from 'jsonwebtoken';

const app = express.Router();

const getStatistics = (email: string) => {
  return User.aggregate([
    {
      $match: {
        email,
      },
    },
    {
      $lookup: {
        from: 'games',
        localField: 'games',
        foreignField: 'gameID',
        as: 'allGames',
      },
    },
    {
      $unwind: {
        path: '$allGames',
      },
    },
    {
      $project: {
        score: '$allGames.score',
      },
    },
    {
      $group: {
        _id: null,
        avgScore: {
          $avg: '$score',
        },
        maxScore: {
          $max: '$score',
        },
      },
    },
  ]);
};

interface IStatsAggData {
  avgScore: number;
  maxScore: number;
}

interface IUserInfo {
  email: string
  username: string
  totalGamesPlayed: number
  avgScore: number
  maxScore: number
  token: string
}

app.get('/userInfo', AuthenticateToken, (req, res) => {
  // generate user token
  const tokenPayload: IUserJWTPayload = {
    // @ts-ignore
    sub: req.user!.sub,
    // @ts-ignore
    name: req.user!.username,
    role: 'normal',
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
    audience: process.env.JWT_AUD,
    expiresIn: '2w',
  });

  // get game statistics
  // @ts-ignore
  const totalGamesPlayed = req.user.games.length;
  // @ts-ignore
  getStatistics(req.user.email).then((stats) => {
    const userStats = <IStatsAggData>stats[0];
    const avgScore = (userStats && userStats.avgScore) || 0;
    const maxScore = (userStats && userStats.maxScore) || 0;

    const result: IUserInfo = {
      // @ts-ignore
      email: req.user!.email,
      // @ts-ignore
      username: req.user!.username!,
      totalGamesPlayed,
      avgScore,
      maxScore,
      token,
    }

    res.json(result);
  });
});

app.post(
  '/userInfo',
  AuthenticateToken,
  body('username').notEmpty().withMessage('Username is required'),
  (req, res, next) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: errors.array({ onlyFirstError: true })[0].msg });
    }

    // check if username is unique
    User.findOne(
      { username: req.body.username },
      (err: any, user: IUserModel) => {
        // @ts-ignore
        if (user && !user._id.equals(req.user._id)) {
          return res.json({ error: 'Username taken' });
        }
        // if no conflicts, update the user object with new username
        // @ts-ignore
        req.user!.update(
          { username: req.body.username },
          (err: any, newUser: IUserModel) => {
            if (err) return next(err);
            return res.json({ success: true });
          }
        );
      }
    );
  }
);

export default app;
