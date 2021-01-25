import mongoose from 'mongoose';

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
  games: [{ score: Number }],
});

const User = mongoose.model('User', userSchema);

export default User;
