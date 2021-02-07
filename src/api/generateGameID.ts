import { getRandomAdjective, getRandomNoun } from '../helpers/randomWords';
import { query, validationResult } from 'express-validator';

import Game from '../models/Game';
import { ServerLogger } from '../logger';
import { ValidCities } from '../cities/randomLocation';
import express from 'express';
import { nextTick } from 'process';

const app = express.Router();

export function getRandomGameID() {
  return (
    getRandomAdjective(true) + getRandomAdjective(true) + getRandomNoun(true)
  );
}

app.get(
  '/getUniqueGameID',
  query('city').custom((value) => {
    if (!ValidCities.includes(value))
      throw new Error('The selected city is invalid.');
    return true;
  }),
  async (req, res, next) => {
    // validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: errors.array({ onlyFirstError: true })[0].msg });
    }

    var gameID = getRandomGameID();

    if (process.env.NODE_ENV === 'test') {
      // don't check for collisions, just return
      return res.json({ gameID });
    }

    try {
      var result = await Game.findOne({ gameID });
      var numAttempts = 1;
      while (result && numAttempts < 100) {
        gameID = getRandomGameID();
        result = await Game.findOne({ gameID });
        numAttempts++;
      }

      // fail if gameID exahaustion
      if (numAttempts === 100) {
        ServerLogger.warn(
          'GameID exhaustion, required 100 tries to find Game ID'
        );
        return res.json({ error: 'Unable to get GameID' });
      }

      // add game to database to store city
      const newGame = new Game({ gameID, city: req.query!.city });
      newGame.save((err, game) => {
        if (err) return next(err);
        return res.json({ gameID });
      });
    } catch (err) {
      ServerLogger.error(err);
      next(err);
    }
  }
);

export default app;
