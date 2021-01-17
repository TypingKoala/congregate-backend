const io = require('socket.io-client');

import { AddressInfo } from 'net';
import { Server } from 'http';
import { Socket } from 'socket.io';
import server from '../app';

export let socket: Socket;
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
 * Connect with Socket.IO client before each test
 */
beforeEach((done) => {
  if (httpServerAddr != null && typeof(httpServerAddr) !== "string") {
    socket = io.connect(`http://localhost:${httpServerAddr.port}`, {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
      transports: ['websocket'],
      auth: {
        token: "TEST_TOKEN" // only valid in test environment
      }
    });
    socket.on('connect', () => {
      done();
    });
  }
});

/**
 * Disconnect Socket.IO client after each test
 */
afterEach((done) => {
  // Cleanup socket and http server
  if (socket.connected) {
    socket.disconnect();
  };
  done();
});