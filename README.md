# API Documentation
This document describes the implemented API of the backend server, along with the associated test files to verify functionality.

- [API Documentation](#api-documentation)
  - [Type: WebSockets](#type-websockets)
    - [Client Connection](#client-connection)
    - [Event: `ping`](#event-ping)
    - [Event](#event)
  - [Type: REST API](#type-rest-api)

## Type: WebSockets
Realtime communication is facilitated by Socket.io, allowing for low-latency implementation (via WebSockets) of server-side game logic.

Each WebSocket message may have side-effects, resulting in changes to state for a user. Users are authenticated on connection.

In the examples below, we assume the backend is running on `http://localhost:4200`.

### Client Connection
To connect to the server, the client must authenticate the user and specify the game room that the user is joining.

```ts
// User's game room acquired via REST API
const gameRoom = 'USER_GAMEROOM';

// User's JWT acquired via REST API
const token = 'USER_TOKEN';

// Connect to socket
const socket = io('http://localhost:4200', {
  query: {
    gameRoom
  },
  auth: {
    token
  }
});
```

### Event: `ping`
* [Implementation](src/realtime-handlers/ping.ts)
* [Tests](src/realtime-handlers/ping.test.ts)

To verify connectivity, the client can send a `ping` event. The server will respond with a `pong` event.

```ts
// request
socket.emit('ping');

// response
socket.on('pong', () => {
  done();
});
```


### Event 


## Type: REST API
Requests that do not require realtime communication are performed through HTTP. These requests are stateless, 