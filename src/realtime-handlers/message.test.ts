const io = require('socket.io-client');

import { AddressInfo } from 'net';
import { Server } from 'http';
import { Socket } from 'socket.io';
import { generateAnonymousToken } from '../api/getAnonymousToken';
import server from '../app';

export let socket1: Socket;
export let socket2: Socket;
let httpServer: Server;
let httpServerAddr: string | AddressInfo | null;

// message data object definition
interface IMessageEventData {
  text: string;
  name: string;
  timestamp: number; // milliseconds since Unix epoch
}

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
  test('should successfully send messages after connecting manually', (done) => {
    expect.assertions(2);
    if (httpServerAddr != null && typeof httpServerAddr !== 'string') {
      socket1 = io.connect(`http://localhost:${httpServerAddr.port}`, {
        'reconnection delay': 0,
        'reopen delay': 0,
        'force new connection': true,
        transports: ['websocket'],
        auth: {
          token: generateAnonymousToken(),
        },
        query: {
          gameID: 'testgame',
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
        query: {
          gameID: 'testgame',
        },
      });

      const testMessage1: IMessageEventData = {
        text: 'test1',
        name: 'test1',
        timestamp: Date.now(),
      };
      const testMessage2: IMessageEventData = {
        text: 'test2',
        name: 'test2',
        timestamp: Date.now(),
      };
      socket1.on('connect', () => {
        socket1.emit('message', testMessage1);
      });
      socket2.on('connect', () => {
        socket2.emit('message', testMessage2);
      });

      var totalMatched = 0;
      // check if socket1 and socket2 received the opposite messages
      socket1.on('message', (data: IMessageEventData) => {
        expect(data).toEqual(testMessage2);
        if (++totalMatched === 2) {
          done();
        }
      });
      socket2.on('message', (data: IMessageEventData) => {
        expect(data).toEqual(testMessage1);
        if (++totalMatched === 2) {
          done();
        }
      });
    }
  });
});
