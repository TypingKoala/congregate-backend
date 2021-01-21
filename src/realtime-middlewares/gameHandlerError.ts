import winston from 'winston';
import { IGameSocket } from './games';
require('../logger');
const logger = winston.loggers.get('server');

export const notInGameHandler = (socket: IGameSocket) => {
  logger.warn('client attempted to perform an action while not in a game', {
    socket: socket.id,
  });
  socket.emit('error', { error: 'Cannot perform action when not in game' });
}