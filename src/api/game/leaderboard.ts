import { ServerLogger } from '../../logger';
import User from '../../models/User';
import express from 'express';
import { redisClient } from '../../app';
import serverOptions from '../../serverOptions';

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
  // check if leaderboard is cached
  redisClient.get('congregate:leaderboard', (err, result) => {
    if (err) return next(err);
    if (result) {
      ServerLogger.info('Returning leaderboard from cache.');
      return res.json(JSON.parse(result));
    } else {
      // generate new leaderboard
      ServerLogger.info('Generating leaderboard.');
      getAvgLeaderboard()
        .then((avgLeaderboard) => {
          getMaxLeaderboard()
            .then((maxLeaderboard) => {
              const result = {
                avgLeaderboard: avgLeaderboard.map((entry) => {
                  return { username: entry._id, avgScore: entry.avgScore };
                }),
                maxLeaderboard: maxLeaderboard.map((entry) => {
                  return { username: entry._id, maxScore: entry.maxScore };
                }),
              };

              // cache response
              redisClient.setex(
                'congregate:leaderboard',
                serverOptions.LEADERBOARD_TTL,
                JSON.stringify(result),
                (err, result) => {
                  if (err) return next(err)
                }
              );

              return res.json(result);
            })
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    }
  });
});

export default app;
