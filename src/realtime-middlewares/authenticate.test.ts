import io from 'socket.io-client';

import { AddressInfo } from 'net';
import { Server } from 'http';
import server from '../app';
import { formatDiagnosticsWithColorAndContext } from 'typescript';

export let socket: any;
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
  if (socket && socket.connected) {
    socket.disconnect();
  }
  done();
});

function connectToSocket(token: string | undefined) {
  return new Promise((resolve, reject) => {
    if (httpServerAddr != null && typeof httpServerAddr !== 'string') {
      const auth = token === undefined ? {} : { token };
  
      socket = io(`http://localhost:${httpServerAddr.port}`, {
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        // @ts-ignore
        auth,
      });
      socket.on('connect', () => {
        resolve(true);
      });
      socket.on('connect_error', (err: any) => {
        reject(true);
      });
    } else {
      reject(true);
    }
  })
}

describe('socket.io:authenticate', () => {
  // TODO: write test to fail when wrong token is provided
  it('should succeed when test token is provided', () => {
    return expect(connectToSocket('TEST_TOKEN')).resolves.toEqual(true);
  });
});
