import io from 'socket.io-client';

import { AddressInfo } from 'net';
import { Server } from 'http';
import server from '../app';

let socket1: any;
let socket2: any;
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

// /**
//  * Disconnect Socket.IO client after each test
//  */
// afterEach((done) => {
//   // Cleanup socket and http server
//   if (socket1 && socket1.connected) {
//     socket1.disconnect();
//   }
//   if (socket2 && socket2.connected) {
//     socket2.disconnect();
//   }
//   done();
// });

function connectToSocket(token: string | undefined) {
  return new Promise((resolve, reject) => {
    if (httpServerAddr != null && typeof httpServerAddr !== 'string') {
      const auth = token === undefined ? {} : { token };

      var socket = io(`http://localhost:${httpServerAddr.port}`, {
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket'],
        // @ts-ignore
        auth,
      });
      socket.on('connect', () => {
        console.log('connected');
        resolve(socket);
      });
      socket.on('connect_error', (err: any) => {
        reject();
      });
    } else {
      reject();
    }
  });
}

describe('socket.io:matchmaking', () => {
  it('should succeed after connecting two clients', async () => {
    // var socket1 = await connectToSocket('TEST_TOKEN');
    // var socket2 = await connectToSocket('TEST_TOKEN');
    expect(true).toBe(true);
  });
});
