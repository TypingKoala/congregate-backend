import bodyParser from 'body-parser';
import express from 'express';
import generateGameID from './generateGameID';
import getAnonymousToken from './getAnonymousToken';

const app = express.Router();

app.use(bodyParser.json());

app.use(generateGameID);
app.use(getAnonymousToken);
app.use('/user', require('./user'));

module.exports = app;
