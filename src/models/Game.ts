import mongoose from 'mongoose';

export interface IGameModel {
  gameID: string;
  score: number;
}

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
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
