import Game from '../../models/Game';
import { ServerLogger } from '../../logger';
import express from 'express';
import { redisClient } from '../../app';
import serverOptions from '../../serverOptions';

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
          redisClient.setex(
            'congregate:heatmap',
            serverOptions.HEATMAP_TTL,
            JSON.stringify(result),
            (err, result) => {
              if (err) return next(err)
            }
          );
          res.json({ finishPositions: result });
        })
        .catch((err: any) => next(err));
    }
  });
});

export default app;
