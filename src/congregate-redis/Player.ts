import Game from './Game';
import { GameStatus } from './GameStatus';
import { IGameSocket } from '../realtime-middlewares/games';
import { Position } from './Position';
import { Socket } from 'socket.io';
import winston from 'winston';

require('../logger');
const logger = winston.loggers.get('server');

export interface IPlayerData {
  username: string;
  pos: Position | undefined;
}

export default class Player {
  readonly username: string;
  readonly email: string;
  private _ready: boolean;
  private _pos?: Position;
  private onUpdate?: (player: Player) => void;
  private onInitialPosition?: () => void;
  private game?: Game;
  socket?: IGameSocket;

  constructor(username: string, email: string) {
    this.username = username;
    this.email = email;
    this._ready = false;
  }

  get ready() {
    return this._ready;
  }

  set ready(readyStatus: boolean) {
    this._ready = readyStatus;
    if (this.onUpdate) this.onUpdate(this);
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
      username: this.username,
      pos: this.pos
    };
  }

  registerOnUpdate(fn: (player: Player) => void) {
    this.onUpdate = fn;
  }

  registerOnInitialPosition(fn: () => void) {
    this.onInitialPosition = fn;
  }

  registerGame(game: Game) {
    this.game = game;
  }

  sendPosition() {
    if (this.onInitialPosition) {
      this.onInitialPosition();
    }
  }

  registerSocket(socket: IGameSocket) {
    this.socket = socket;
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}
