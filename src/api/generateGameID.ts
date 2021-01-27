import { getRandomAdjective, getRandomNoun } from '../helpers/randomWords';

import Game from '../models/Game';
import { ServerLogger } from '../logger';
import express from 'express';
import { nextTick } from 'process';

const app = express.Router();

export function getRandomGameID() {
  return (
    getRandomAdjective(true) + getRandomAdjective(true) + getRandomNoun(true)
  );
}

app.get('/getUniqueGameID', async (req, res, next) => {
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
    if (numAttempts === 100) {
      ServerLogger.warn(
        'GameID exhaustion, required 100 tries to find Game ID'
      );
      return res.json({ error: 'Unable to get GameID' });
    }

    return res.json({ gameID });
  } catch (err) {
    ServerLogger.error(err);
    next(err);
  }
});

export default app;
