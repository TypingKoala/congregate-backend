import { Socket } from 'socket.io';
import { Position } from './Position';

export interface IPlayerData {
  username: string
}

export default class Player {
  readonly username: string;
  readonly email: string;
  ready: boolean;
  private pos?: Position;
  socket?: Socket;

  constructor(username: string, email: string, socket?: Socket) {
    this.username = username;
    this.email = email;
    this.ready = false;
    this.socket = socket;
  }

  updatePos(pos: Position) {
    this.pos = pos;
  }

  getPos() {
    return this.pos;
  }

  getPlayerData(): IPlayerData {
    return {
      username: this.username
    }
  }
}
