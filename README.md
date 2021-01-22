# API Documentation
This document describes the implemented API of the backend server, along with the associated test files to verify functionality.

- [API Documentation](#api-documentation)
  - [Basic User Flow](#basic-user-flow)
    - [Creating and joining a private lobby](#creating-and-joining-a-private-lobby)
    - [Matchmaking](#matchmaking)
  - [Type: SocketIO](#type-socketio)
    - [Client Connection](#client-connection)
    - [Event: `ping` and `pong`](#event-ping-and-pong)
    - [Event `matchSuccess`](#event-matchsuccess)
    - [TODO: Event `message`](#todo-event-message)
    - [TODO: Event: `gameUpdate`](#todo-event-gameupdate)
    - [Event: `gameStatus`](#event-gamestatus)
    - [Event: `playerReady`](#event-playerready)
    - [Event: `initialPosition`](#event-initialposition)
  - [Type: REST API](#type-rest-api)
    - [Route: `/`](#route-)
    - [Route `/api/getUniqueGameID`](#route-apigetuniquegameid)
    - [Route `/api/getAnonymousToken`](#route-apigetanonymoustoken)


## Basic User Flow
Since this is a two-player game, users are able to either create a new private lobby, enter matchmaking, or join an existing private lobby. 

### Creating and joining a private lobby
To create a private lobby, use the HTTP API to get a unique Game ID. The frontend can then connect this client to the game session using Socket IO, and create a link for the user to send to a friend to also connect to the same game session. This implementation can be done completely in the front-end, so long as both users connect via Socket IO using the *same* Game ID and different user accounts (based on the JWT payload).

### Matchmaking
Matchmaking is performed by connecting to a specific Socket IO route. Once a match is made, the server will send the Game ID to the client to connect to. All other logic after this point remains the same as a private lobby.

## Type: SocketIO
Realtime communication is facilitated by [SocketIO](https://socket.io), allowing for low-latency implementation (via WebSockets) of server-side game logic.

Each WebSocket message may have side-effects, resulting in changes to state for a user. Users are authenticated on connection.

In the examples below, we assume the backend is running on `http://localhost:4200`.

### Client Connection
To connect to the server, the client must authenticate the user and specify the game room that the user is joining. If a game room is not specified, then the user will be placed into
a matchmaking session. 

```ts
// User's game room acquired via REST API
const gameID = 'USER_GAMEROOM';

// User's JWT acquired via REST API
const token = 'USER_TOKEN';

// Connect to socket
const socket = io('http://localhost:4200', {
  query: {
    gameID // this isn't required if matchmaking
  },
  auth: {
    token
  }
});
```

### Event: `ping` and `pong`
* [Implementation](src/realtime-handlers/ping.ts)
* [Tests](src/realtime-handlers/ping.test.ts)

To verify connectivity, the client can emit a `ping` event. The server will respond with a `pong` event. No data other than the event names will be handled.

```ts
// request
socket.emit('ping');

// response
socket.on('pong', () => {
  done();
});
```

### Event `matchSuccess`
* [Implementation](src/realtime-middlewares/matchmaking.ts)
* [Tests](src/realtime-middlewares/matchmaking.test.ts)

This event will be sent from the server to the client once the server has found
a match in matchmaking. The new Game ID will be sent to the client, and the socket
will automatically connect to the room without any additional client intervention

```ts
interface IMatchSuccessData {
  gameID: string
}

// when a match is successful
socket.on('matchSuccess', (data: IMatchSuccessData) => {
  console.log(data);
})
```

### TODO: Event `message`
Not implemented yet. 

The `message` event will allow the two players to communicate using text chat. A client can emit a `message`, which will result in that message being emitted to the other user to display in the text chat.

The server will not respond when sending a message, but a `message` event will be emitted when another player has sent a message to the client.

```ts
// message data object definition
interface IMessageEventData {
  text: string
  name: string
  timestamp: number // milliseconds since Unix epoch
}

// request
const messageData: IMessageEventData = {
  text: 'hello',
  name: 'John',
  timestamp: Date.now()
};
socket.emit('message', messageData);

// response: none

// receiving messages from other userss
socket.on('message', (messageData: IMessageEventData) => {
  console.log(messageData);
})
```

### TODO: Event: `gameUpdate`
Not implemented yet. 

This event should be sent from the client to the server whenever the game state changes on the client-side.

The server will not respond to this event.

```ts
// game update data object definition
interface IGameUpdateData {
  // send current player coordinates
  pos: {
    lat: number,
    lng: number
  }
}

// request
const gameUpdateData: IGameUpdateData = {
  pos: {
    lat: -34,
    lng: 151
  }
}
socket.emit('gameUpdate', gameUpdateData);

// response: none
```

### Event: `gameStatus`
* [Implementation](src/congregate-redis/GameStatus.ts)
* [Tests](src/congregate-redis/Game.test.ts)

This event is sent from the server to the clients when the game state changes. This
information is sent about once a second, updating the `timeRemaining` field.

```ts
enum GameStatus {
  InLobby = "InLobby", // when waiting for other player
  Starting = "Starting", // game is starting in 3 seconds
  InProgress = "InProgress", // game in progress
  Win = "Win", // players found each other
  Loss = "Loss", // players ran out of time
}

interface IPlayerData {
  username: string
}

// game status data object definition
interface IGameStatusData {
  status: GameStatus
  timeRemaining: number // in seconds
  score: number // cumulative score after each game
  players: IPlayerData[]
}

// request: none

// response: n/a

// on game status update
socket.on('gameStatus', (gameStatus: IGameStatusData) => {
  console.log(gameStatus);
})
```

### Event: `playerReady`
* [Implementation](src/realtime-handlers/playerReady.ts)

Note: This event should be only emitted by the client when in the `InLobby` game state.

The client should emit this message once the player is ready to begin. When both players are ready, the game will progress to the `Starting` state.

After the countdown, the server will send the `initialPositions` event, described below.

```ts
// request
socket.emit('playerReady');

// response: none
```

### Event: `initialPosition`
* [Implementation](src/realtime-middlewares/games.ts)

When the server generates the intitial positions, it will send the initial position
of the player once the game starts.

```ts
// on game start
socket.on('initialPosition', (gameUpdateData: IGameUpdateData) => {
  console.log(gameUpdateData);
});
```

## Type: REST API
Requests that do not require realtime communication are performed through HTTP. 

### Route: `/`
Returns metadata about the API.

* Request
  * Path: `/`
* Response
  * `Content-Type: application/json`
  * Fields:
    * `connected` (boolean): always `true`
    * `version` (number): specifies the version number of the API (starting at `1`)

### Route `/api/getUniqueGameID`
* [Implementation](src/api/generateGameID.ts)
* [Tests](src/api/generateGameID.test.ts)

Returns a unique Game ID (UGID) that can be used to start a new game session.

* Request
  * Path: `/api/getUniqueGameID`
* Response
  * `Content-Type: application/json`
  * Fields:
    * `gameID` (string): the requested UGID
    * `error` (string): an error message to display to the user if an error occurred

### Route `/api/getAnonymousToken`
* [Implementation](src/api/getAnonymousToken.ts)
* [Tests](src/api/getAnonymousToken.test.ts)
  
Returns a token to be used for Socket IO authentication for an anonymous user.

* Request
  * Path: `/api/getAnonymousToken`
* Response
  * `Content-Type: application/json`
  * Fields:
    * `token` (string): an anonymous token
    * `error` (string): an error message to display to the user if an error occurred