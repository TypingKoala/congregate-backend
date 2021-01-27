import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import User, { IUserModel } from '../../models/User';
import { AuthenticateToken } from './tokenAuth';

const app = express.Router();

const getStatistics = (email: string) => {
  return User.aggregate([
    {
      '$match': {
        email
      }
    }, {
      '$lookup': {
        'from': 'games', 
        'localField': 'games', 
        'foreignField': 'gameID', 
        'as': 'allGames'
      }
    }, {
      '$unwind': {
        'path': '$allGames'
      }
    }, {
      '$project': {
        'score': '$allGames.score'
      }
    }, {
      '$group': {
        '_id': null, 
        'avgScore': {
          '$avg': '$score'
        }, 
        'maxScore': {
          '$max': '$score'
        }
      }
    }
  ])
}

interface IStatsAggData {
  avgScore: number
  maxScore: number
}

app.get(
  '/userInfo',
  AuthenticateToken,
  (req, res) => {
    // get game statistics
    // @ts-ignore
    const totalGamesPlayed = req.user.games.length;
    // @ts-ignore
    getStatistics(req.user.email)
    .then(stats => {
      const userStats = <IStatsAggData>stats[0];
      const avgScore = userStats.avgScore || 0;
      const maxScore = userStats.maxScore || 0;

      res.json({
        // @ts-ignore
        email: req.user!.email,
        // @ts-ignore
        username: req.user!.username!,
        totalGamesPlayed,
        avgScore,
        maxScore
      });
    })

    
  }
);

app.post(
  '/userInfo',
  passport.authenticate('jwt', { session: false }),
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  (req, res, next) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: errors.array({ onlyFirstError: true })[0].msg });
    }

      // check if username is unique
      User.findOne({ username: req.body.username }, (err: any, user: IUserModel) => {
        // @ts-ignore
        if (user && user._id !== req.user._id) return res.json({ error: "Username taken" })

        // if no conflicts, update the user object with new username
        // @ts-ignore
        req.user!.update({ username: req.body.username }, (err: any, newUser: IUserModel) => {
          if (err) return next(err);
          return res.json({ success: true })
        })
      })


  }
);

export default app;
