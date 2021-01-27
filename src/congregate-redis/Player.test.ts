import Player from './Player';
import { Socket } from 'socket.io';

describe('Player', () => {
  it('stores the username and email', () => {
    const newPlayer = new Player('username', 'email');
    expect(newPlayer.username).toBe('username');
    expect(newPlayer.email).toBe('email');
  });

  it('allows update and getting of position', () => {
    const newPlayer = new Player('username', 'email');
    newPlayer.pos = {
      lat: 10,
      lng: 10,
    };
    expect(newPlayer.pos).toEqual({
      lat: 10,
      lng: 10,
    });
  });
});
