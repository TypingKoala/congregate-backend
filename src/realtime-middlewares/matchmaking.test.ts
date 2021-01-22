const io = require('socket.io-client');

import { AddressInfo } from 'net';
import { Server } from 'http';
import { Socket } from 'socket.io';
import server from '../app';
import { generateAnonymousToken } from '../api/getAnonymousToken';

export let socket1: Socket;
export let socket2: Socket;
let httpServer: Server;
let httpServerAddr: string | AddressInfo | null;

/**
 * Start backend server
 */
beforeAll((done) => {
  httpServer = server.listen();
  httpServerAddr = server.address();
  done();
});

/**
 * Stop backend server
 */
afterAll((done) => {
  httpServer.close(() => {
    done();
  });
});

/**
 * Disconnect Socket.IO client after each test
 */
afterEach((done) => {
  // Cleanup socket and http server
  if (socket1.connected) {
    socket1.disconnect();
  }
  if (socket2.connected) {
    socket2.disconnect();
  }
  done();
});

describe('socket.io', () => {
  test('should successfully complete matchmaking', (done) => {
    if (httpServerAddr != null && typeof httpServerAddr !== 'string') {
      socket1 = io.connect(`http://localhost:${httpServerAddr.port}`, {
        'reconnection delay': 0,
        'reopen delay': 0,
        'force new connection': true,
        transports: ['websocket'],
        auth: {
          token: generateAnonymousToken(),
        },
      });
      socket2 = io.connect(`http://localhost:${httpServerAddr.port}`, {
        'reconnection delay': 0,
        'reopen delay': 0,
        'force new connection': true,
        transports: ['websocket'],
        auth: {
          token: generateAnonymousToken(),
        },
      });

      var totalMatched = 0;
      socket1.on('matchSuccess', () => {
        if (++totalMatched === 2) {
          done();
        }
      });
      socket2.on('matchSuccess', () => {
        if (++totalMatched === 2) {
          done();
        }
      });
    }
  });
});
