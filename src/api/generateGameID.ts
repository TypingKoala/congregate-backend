import { getRandomAdjective, getRandomNoun } from '../helpers/randomWords';

import Game from '../models/Game';
import { ServerLogger } from '../logger';
import express from 'express';

const app = express.Router();

export function getRandomGameID() {
  return (
    getRandomAdjective(true) + getRandomAdjective(true) + getRandomNoun(true)
  );
}

app.get('/getUniqueGameID', async (req, res) => {
  var gameID = 'RubberyExaltedWolf';

  var result = await Game.findOne({ gameID });
  var numAttempts = 1;
  while (result && numAttempts < 100) {
    var gameID = getRandomGameID();
    result = await Game.findOne({ gameID });
    numAttempts++;
  }

  if (numAttempts === 100) {
    ServerLogger.warn('GameID exhaustion, required 100 tries to find Game ID');
  }

  return res.json({ gameID });
});

export default app;
