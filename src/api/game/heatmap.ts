import Game from '../../models/Game';
import express from 'express';

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
  _id: string,
  pos: [number, number]
}

app.get('/heatmap', (req, res, next) => {
  // get game statistics
  // @ts-ignore
  getFinishPositions()
    .then((finishPositions: any) => {
      // clean finish positions
      const result = finishPositions.map((finishPos: IFinishPosition) => {
        return { pos: finishPos.pos }
      })
      res.json({ finishPositions: result });
    })
    .catch((err: any) => next(err));
});

export default app;
