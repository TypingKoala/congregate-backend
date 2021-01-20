import { Position } from './Position';

export interface IPlayerData {
  username: string
}

export default class Player {
  readonly username: string;
  readonly email: string;
  ready: boolean;
  private pos?: Position;

  constructor(username: string, email: string) {
    this.username = username;
    this.email = email;
    this.ready = false;
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
