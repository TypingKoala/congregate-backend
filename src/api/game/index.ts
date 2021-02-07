import cities from './cities';
import express from 'express';
import heatmap from './heatmap';
import leaderboard from './leaderboard';

const app = express.Router();

app.use(leaderboard);
app.use(heatmap);
app.use(cities);

module.exports = app;
