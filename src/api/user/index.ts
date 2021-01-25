import express from 'express';
import sendLoginEmail from './sendLoginEmail'
import token from './token'

const app = express.Router();

app.use(sendLoginEmail);
app.use(token);

module.exports = app;
