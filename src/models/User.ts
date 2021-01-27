import { IGameModel, gameSchema } from './Game';

import mongoose from 'mongoose';

export interface IUserModel {
  email: string;
  username: string;
  games: [IGameModel];
}

const userSchema = new mongoose.Schema({
  email: {
    required: true,
    unique: true,
    type: String,
  },
  username: {
    required: true,
    type: String,
  },
  games: [String],
});

const User = mongoose.model('User', userSchema);

export default User;
