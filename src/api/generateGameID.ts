import express from 'express';
import { getRandomAdjective, getRandomNoun } from '../helpers/randomWords';

const app = express.Router();

export function getRandomGameID() {
  return (
    getRandomAdjective(true) + getRandomAdjective(true) + getRandomNoun(true)
  );
}

app.get('/getUniqueGameID', (req, res) => {
  var gameID = getRandomGameID();

  // TODO: generate until no collisions
  const collision = false;
  while (collision) {
    var gameID = getRandomGameID();
  }

  return res.json({ gameID })
})

export default app;