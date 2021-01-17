const io = require('socket.io-client');
const http = require('http');

import { AddressInfo } from 'net';
import { Server } from 'http';
import { Socket } from 'socket.io';
import server from './app';

let socket: Socket;
let httpServer: Server;
let httpServerAddr: string | AddressInfo | null;

/**
 * Setup WS & HTTP servers
 */
beforeAll((done) => {
  httpServer = server.listen();
  httpServerAddr = server.address();
  console.log(httpServerAddr);
  done();
});

/**
 *  Cleanup WS & HTTP servers
 */
afterAll((done) => {
  httpServer.close();
  done();
});

/**
 * Run before each test
 */
beforeEach((done) => {
  // Setup
  // Do not hardcode server port and address, square brackets are used for IPv6
  if (httpServerAddr != null && typeof(httpServerAddr) !== "string") {
    socket = io.connect(`http://localhost:${httpServerAddr.port}`, {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
      transports: ['websocket'],
    });
    socket.on('connect', () => {
      done();
    });
  }
});

/**
 * Run after each test
 */
afterEach((done) => {
  // Cleanup
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});


describe('socket.io', () => {
  test('should ping', (done) => {
    socket.emit('ping')
    socket.on('pong', () => {
      done();
    });
    done();
  });
});
