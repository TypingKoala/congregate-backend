import express from 'express';
import leaderboard from './leaderboard';

const app = express.Router();

app.use(leaderboard);

module.exports = app;
