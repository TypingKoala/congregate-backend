import mongoose from 'mongoose';
import { gameSchema, IGameModel } from './Game';

export interface IUserModel {
  email: string
  username: string
  games: [IGameModel]
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
  games: [gameSchema],
});

const User = mongoose.model('User', userSchema);

export default User;
