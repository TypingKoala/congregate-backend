import { socket } from './test_boilerplate';

describe('socket.io', () => {
  test('should ping', (done) => {
    socket.emit('ping');
    socket.on('pong', () => {
      done();
    });
  });
});

