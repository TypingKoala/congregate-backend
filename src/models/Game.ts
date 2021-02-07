import { Cities } from '../cities/randomLocation';
import mongoose from 'mongoose';

export interface IGameModel {
  gameID: string;
  score: number;
  city: Cities
}

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

export const gameSchema = new mongoose.Schema({
  gameID: {
    required: true,
    unique: true,
    type: String,
  },
  score: {
    default: 0,
    type: Number,
  },
  finishPositions: {
    type: [pointSchema]
  },
  city: {
    type: String
  }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
