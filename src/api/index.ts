import express from 'express';
import generateGameID from './generateGameID'

const app = express.Router();

app.use(generateGameID);

module.exports = app;