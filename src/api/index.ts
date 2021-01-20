import express from 'express';
import generateGameID from './generateGameID';
import getAnonymousToken from './getAnonymousToken';

const app = express.Router();

app.use(generateGameID);
app.use(getAnonymousToken);

module.exports = app;
