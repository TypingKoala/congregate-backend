import { ValidCities } from '../../cities/randomLocation';
import express from 'express';

const app = express.Router();

app.get('/cities', (req, res) => {
  return res.json({ cities: ValidCities })
});

export default app;
