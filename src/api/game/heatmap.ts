import Game from '../../models/Game';
import { ServerLogger } from '../../logger';
import express from 'express';
import { redisClient } from '../../app';

const app = express.Router();

const getFinishPositions = () => {
  return Game.aggregate([
    {
      $unwind: {
        path: '$finishPositions',
      },
    },
    {
      $project: {
        pos: '$finishPositions.coordinates',
      },
    },
  ]);
};

interface IFinishPosition {
  _id: string;
  pos: [number, number];
}

app.get('/heatmap', (req, res, next) => {
  // check if heatmap is cached
  redisClient.get('congregate:heatmap', (err, result) => {
    if (err) return next(err);
    if (result) {
      ServerLogger.info('Returning heatmap from cache.');
      return res.json(JSON.parse(result));
    } else {
      // generate new heatmap
      ServerLogger.info('Generating new heatmap');
      getFinishPositions()
        .then((finishPositions: any) => {
          // clean finish positions
          const result = finishPositions.map((finishPos: IFinishPosition) => {
            return { pos: finishPos.pos };
          });
          redisClient.set(
            'congregate:heatmap',
            JSON.stringify(result),
            (err) => {
              if (err) return next(err);
              redisClient.expire(
                'congregate:heatmap',
                parseInt(process.env.HEATMAP_TTL!)
              );
            }
          );
          res.json({ finishPositions: result });
        })
        .catch((err: any) => next(err));
    }
  });
});

export default app;
