import { Socket } from 'socket.io';
import Player from './Player';

describe('Player', () => {
  it('stores the username and email', () => {
    const newPlayer = new Player('username', 'email');
    expect(newPlayer.username).toBe('username');
    expect(newPlayer.email).toBe('email');
  });

  it('allows update and getting of position', () => {
    const newPlayer = new Player('username', 'email');
    newPlayer.updatePos({
      lat: 10,
      lng: 10,
    });
    expect(newPlayer.getPos()).toEqual({
      lat: 10,
      lng: 10,
    });
  });
});
