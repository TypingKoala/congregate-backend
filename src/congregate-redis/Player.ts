import { Socket } from 'socket.io';
import { Position } from './Position';

export interface IPlayerData {
  username: string
}

export default class Player {
  readonly username: string;
  readonly email: string;
  private _ready: boolean;
  private _pos?: Position;
  socket?: Socket;
  private onUpdate?: (player: Player) => void;

  constructor(username: string, email: string, socket?: Socket) {
    this.username = username;
    this.email = email;
    this._ready = false;
    this.socket = socket;
  }

  get ready() {
    return this._ready;
  }

  set ready(status: boolean) {
    this._ready = status;
    if (this.onUpdate) this.onUpdate(this)
  }

  get pos() {
    return this._pos;
  }

  set pos(pos: Position | undefined) {
    this._pos = pos;
    if (this.onUpdate) this.onUpdate(this);
  }

  getPlayerData(): IPlayerData {
    return {
      username: this.username
    }
  }

  registerOnUpdate(fn: (player: Player) => void) {
    this.onUpdate = fn;
  }
}
