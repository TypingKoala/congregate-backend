import express from 'express';
import sendLoginEmail from './sendLoginEmail'

const app = express.Router();

app.use(sendLoginEmail);

module.exports = app;
