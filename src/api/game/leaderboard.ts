import User from '../../models/User';
import express from 'express';

const app = express.Router();

const getAvgLeaderboard = () => {
  return User.aggregate([
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
      $group: {
        _id: '$username',
        avgScore: {
          $avg: '$allGames.score',
        },
      },
    },
    {
      $sort: {
        avgScore: -1,
      },
    },
    {
      $limit: 10,
    },
  ]);
};

const getMaxLeaderboard = () => {
  return User.aggregate([
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
      $group: {
        _id: '$username',
        maxScore: {
          $max: '$allGames.score',
        },
      },
    },
    {
      $sort: {
        maxScore: -1,
      },
    },
    {
      $limit: 10,
    },
  ]);
};

interface ILeaderboardInfo {
  username: string;
  avgScore?: number;
  maxScore?: number;
}

app.get('/leaderboard', (req, res, next) => {
  // get game statistics
  // @ts-ignore
  getAvgLeaderboard().then((avgLeaderboard) => {
    getMaxLeaderboard().then((maxLeaderboard) => {
      res.json({
        avgLeaderboard: avgLeaderboard.map((entry) => {
          return { username: entry._id, avgScore: entry.avgScore };
        }),
        maxLeaderboard: maxLeaderboard.map((entry) => {
          return { username: entry._id, maxScore: entry.maxScore };
        }),
      });
    }).catch((err) => next(err));
  }).catch((err) => next(err));
});

export default app;
