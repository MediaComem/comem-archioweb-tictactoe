# Implementing tic-tac-toe with WebSockets

In this variant of the exercise, you will use the [WebSocket protocol][ws] to
implement the communications between the tic-tac-toe backend and frontend.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Tips

* **Keep your browser's developer console open** throughout this exercise to see
  messages and errors logged by the frontend client.
* Each step introduces a small bit of functionality which can usually be tested
  after refreshing your browser. Keep an eye on your browser's developer console
  and on the terminal where your are running the backend. Various **messages
  will be logged** to indicate what is happening.
* **Edit the correct file:** when a step is titled `Backend: ...`, it means that
  you must edit the `app/backend/dispatcher.js` file. Conversely, when a step is
  titled `Frontend: ...`, you must edit the `app/frontend/dispatcher.js` file.
* The mention `// <PREVIOUS CODE HERE...>` indicates that you should add new
  code underneath the code you previously added in a given section. Unless
  specified otherwise, you should never have to delete code.



## Backend: set up a WebSocket server

**Install the [`ws` package][ws-npm]**, the most popular WebSocket package on
the npm registry:

```bash
$> npm install ws
```

To use it in the backend's Node.js code, you need to import it. **Add this
statement at the top of the file**:

```js
const WebSocket = require('ws');
```

You will use a classic client-server model, with the tic-tac-toe backend being
the server, and the frontend being the client (running in a browser). The
backend will be reachable at a specific URL so that the frontend can open a
WebSocket connection to it.

In order to do this, you first need to set up a WebSocket server. The
documentation of the `ws` package [explains how to do this][ws-server].

Since WebSockets can share a port with HTTP, and the tic-tac-toe backend is an
Express.js application running on top of a Node.js HTTP server, you can plug
your new WebSocket server into that existing HTTP server.

**Add the following code to the `COMMUNICATIONS` section**:

```js
// COMMUNICATIONS
// ==============

const wss = new WebSocket.Server({
  server
});

// Handle new client connections.
wss.on('connection', function(ws) {
  logger.info('New WebSocket client connected');
});
```

Your tic-tac-toe backend is now ready to accept WebSocket connections.

> Note that the `server` variable is available because it is provided for you as
> an argument to the `createBackendDispatcher` function (its declaration is at
> the top of the file). Look at the
> [`app/backend/bin/www`](./app/backend/bin/www) file to see where and how this
> server is created.



## Frontend: connect to the backend

You do not need to import the `ws` package in the frontend, since the
`WebSocket` object is natively available in a browser's environment (as long as
you use a modern browser).

You now want the frontend to open a WebSocket connection to the backend. Since
frontend files are served by the backend, the URL of the backend is simply the
current browser's location. Connecting to it is as simple as instantiating a
[`WebSocket` object][ws-object] with the correct URL. It will emit the `open`
event as soon as it has successfully opened a connection.

**Add the following code to the `COMMUNICATIONS` section**:

```js
// COMMUNICATIONS
// ==============

// Open a WebSocket connection to the backend.
const wsProtocol = window.location.protocol.startsWith('https') ? 'wss' : 'ws';
const wsUrl = `${wsProtocol}://${window.location.hostname}:${window.location.port}`;
const ws = new WebSocket(wsUrl);

ws.onopen = function() {
  console.log(`Connected to WebSocket server at ${WS_URL}`);
};
```

If you refresh your browser window, **you should see 2 log messages**:

* One in the browser's developer console, indicating that the frontend has
  successfully connected to the backend.
* One in the terminal where you are running the backend, indicating that a new
  frontend client has successfully connected.

Your tic-tac-toe backend and frontend are now connected and can exchange
real-time messages over a WebSocket connection.



## Backend: create a tic-tac-toe player for each new WebSocket client

In order for users to play the game, the backend will need to register a player
for each new frontend client that connects to it. It will also need to remember
which player corresponds to which WebSocket client, so that it may send messages
to the correct player later.

**Add the following code to the `SETUP` section**. This JavaScript object will
map player IDs to WebSocket clients:

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

const clients = {};
```

You now want to store WebSocket clients in this map as they connect. **Add the
following code to the `wss.on('connection')` callback in the `COMMUNICATIONS`
section**:

```js
wss.on('connection', function(ws) {
  // <PREVIOUS CODE HERE...>

  // Create a player for each newly connected frontend client.
  const newPlayer = playerController.createPlayer();
  logger.info(`Player ${newPlayer.id} created`);

  // Map the new player's ID to the WebSocket client.
  clients[newPlayer.id] = ws;
});
```

This introduces a potential memory leak: the `clients` object will keep growing
indefinitely as new WebSocket clients connect. You must delete players' IDs and
WebSocket clients as they disconnect. **Add the following code to the
`wss.on('connection')` callback in the `COMMUNICATIONS` section**:

```js
wss.on('connection', function(ws) {
  // <PREVIOUS CODE HERE...>

  // Forget the mapping when the client disconnects.
  ws.on('close', function() {
    logger.info(`Player ${newPlayer.id} disconnected`);
    gameManager.removePlayer(newPlayer.id);
    delete clients[newPlayer.id];
  });
});
```

Refresh your browser and **you should see the player being created** in the
terminal where you are running the backend, as soon as the frontend client
connects.



## Backend: send the `setPlayer` command to newly connected clients

Although you have created a player object in the backend, the frontend is not
aware of this yet. It is time to send this application's first WebSocket
message.

First, **add this code to the `SETUP` section**.

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

function sendMessageToPlayer(playerId, messageData) {
  const client = clients[playerId];
  if (client) {
    client.send(JSON.stringify(messageData));
  }
}
```

> This new `sendMessageToPlayer` function makes use of the `clients` map you
> just created to find the correct WebSocket client to send a message to for a
> given player. It uses `JSON.stringify` so that any structured data you send
> may be easily decoded on the other side with `JSON.parse`.

Before sending just any random data, you should decide on a format for your
WebSocket messages. Having a consistent format will make your code easier to
understand. We suggest the following format:

```json
{
  "resource": "<game|player>",
  "command": "<command>",
  "params": {
    "<key>": "<value>"
  }
}
```

> The `resource` property separates messages into high-level categories, in this
> case game-related or player-related. The `command` property indicates what
> kind of action should be performed, and the `params` property may contain any
> key/value pairs relevant to the command.

Now that you have a format, you can define your first message. Since what you
want to do right now is tell the frontend about the new player, let's send a
`setPlayer` command for the `player` resource, with the newly created player as
a parameter.

**Add the following code to the `wss.on('connection')` callback in the
`COMMUNICATIONS` section**:

```js
wss.on('connection', function(ws) {
  // <PREVIOUS CODE HERE...>

  // Send the player to the client.
  sendMessageToPlayer(newPlayer.id, {
    resource: 'player',
    command: 'setPlayer',
    params: {
      player: newPlayer
    }
  });
});
```

Refresh your browser and **you should see the new message being received** in
the network tab of the developer console (in Chrome, open the `Network` tab in
the developer console, select the request with the `websocket` type and open the
`Messages` sub-tab).



## Frontend: handle the `setPlayer` command

The frontend must now be able to handle the `setPlayer` command. You will need
to store the newly created player. Storing in memory is sufficient for the
purposes of this exercise, so you can simply **add the following declaration to
the `SETUP` section**:

```js
// SETUP
// =====

let currentPlayer;
```

To handle commands, you must first receive the backend's messages. The
`WebSocket` object's `message` event is emitted every time a message is
received. **Add the following code to the `ws.onopen` callback in the
`COMMUNICATIONS` section**:

```js
ws.onopen = function() {
  // <PREVIOUS CODE HERE...>

  // Dispatch server messages.
  ws.onmessage = function(message) {

    console.log(`Received message from server: ${message.data}`);
    const messageData = JSON.parse(message.data);
  };
};
```

> Note that the message data that was encoded by the backend with
> `JSON.stringify` is now decoded on the frontend with `JSON.parse`.

Refresh your browser and **you should see backend messages being logged** in the
developer console as they are received.

Messages from the backend are now being received and decoded, but have yet to be
handled. Since you have a well-defined message format, you can dispatch the
handling of these messages to separate functions to limit complexity.

**Add the following code to the `ws.onmessage` callback in the `COMMUNICATIONS`
section**:

```js
// Dispatch server messages.
ws.onmessage = function(message) {
  // <PREVIOUS CODE HERE...>

  /**
   * Message data format:
   * {
   *   "resource": "<game|player>".
   *   "command": "<command>",
   *   "params": {
   *     "<key>": "<value>"
   *   }
   * }
   */
  switch (messageData.resource) {
    case 'player':
      dispatchPlayerCommand(messageData.command, messageData.params);
      break;
  }
};
```

This dispatches messages based on the `resource` property. Of course, you must
implement the `dispatchPlayerCommand` function. **Add the following code to the
`PLAYER MANAGEMENT` section:**

```js
// PLAYER MANAGEMENT
// =================

function dispatchPlayerCommand(command, params) {
  switch (command) {
    case 'setPlayer':
      handleSetPlayerCommand(params.player);
      break;
  }
}
```

This new function dispatches messages again based on the `command` property.
Again, you must implement the `handleSetPlayerCommand` function. **Add the
following code to the `PLAYER MANAGEMENT` section**:

```js
// PLAYER MANAGEMENT
// =================

// <PREVIOUS CODE HERE...>

function handleSetPlayerCommand(player) {
  currentPlayer = player;
  console.log(`Player ID is ${currentPlayer.id}`);
}
```

Refresh your browser and **you should see the player ID being logged in the
developer console**.



## Frontend: send the `createGame` command when the user clicks on the Create Game button

```js
// Handle DOM events.
viewManager.on('createGame', () => onCreateGameClicked(ws));
```

```js
// GAME MANAGEMENT
// ===============

function onCreateGameClicked(ws) {
  if (!currentPlayer) {
    return viewManager.displayToast('No player information available');
  }

  ws.send(JSON.stringify({
    resource: 'game',
    command: 'createGame',
    params: {}
  }));
}
```



## Backend: handle the `createGame` command, send the `startGame` command

```js
// Receive and dispatch messages from clients.
ws.on('message', function(message) {

  logger.debug(`New client message: ${message}`);
  const messageData = JSON.parse(message);

  switch (messageData.resource) {
    case 'game':
      dispatchGameCommand(messageData.command, messageData.params, newPlayer);
      break;
  }
});
```

```js
// GAME MANAGEMENT
// ===============

function dispatchGameCommand(command, params, currentPlayer) {
  switch (command) {
    case 'createGame':
      handleCreateGameCommand(currentPlayer.id);
      break;
  }
}
```

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function handleCreateGameCommand(playerId) {
  let newGame;

  try {
    newGame = gameController.createNewGame(playerId);
    logger.info(`Player ${playerId} created game ${newGame.id}`);
  } catch (err) {
    return handleError(playerId, err);
  }

  sendMessageToPlayer(playerId, {
    resource: 'game',
    command: 'startGame',
    params: {
      game: newGame
    }
  });
}
```

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

function handleError(playerId, err) {
  sendMessageToPlayer(playerId, {
    resource: 'game',
    command: 'error',
    params: {
      code: err.code,
      message: err.message
    }
  });
}
```



## Frontend: handle the `startGame` command

```js
// GAME MANAGEMENT
// ===============

function dispatchGameCommand(command, params) {
  switch (command) {
    case 'error':
      handleError(`Game error: ${params.message}`);
      break;
    case 'startGame':
      handleStartGameCommand(params.game);
      break;
  }
}
```

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

let currentGame;

function handleError(message) {
  viewManager.displayToast(message);
}
```

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function handleStartGameCommand(game) {
  currentGame = game;
  viewManager.displayGame(game, currentPlayer);
}
```



## Backend: handle the `addJoinableGames` command

**NOTE:** you will need 2 browser windows (i.e. 2 players) to test the application from now on.

```js
for (const player of gameManager.players) {
  if (player.id !== playerId) {
    sendMessageToPlayer(player.id, {
      resource: 'game',
      command: 'addJoinableGames',
      params: {
        games: [ newGame ]
      }
    });
  }
}
```

```js
// Send currently joinable games to the client.
const currentGames = gameController.getJoinableGames();
sendMessageToPlayer(newPlayer.id, {
  resource: 'game',
  command: 'addJoinableGames',
  params: {
    games: currentGames
  }
});
```



## Frontend: handle the `addJoinableGames` command

```js
case 'addJoinableGames':
  handleAddJoinableGamesCommand(params.games);
  break;
```

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function handleAddJoinableGamesCommand(games) {
  for (const game of games) {
    viewManager.addJoinableGame(game);
  }
}
```



## Frontend: send the `joinGame` command when the user clicks the Join Game button

```js
viewManager.on('joinGame', gameId => onJoinGameClicked(ws, gameId));
```

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function onJoinGameClicked(ws, gameId) {
  ws.send(JSON.stringify({
    resource: 'game',
    command: 'joinGame',
    params: {
      gameId
    }
  }));
}
```



## Backend: handle the `joinGame` command, send the `startGame` and `removeJoinable` commands

```js
case 'joinGame':
  handleJoinGameCommand(params.gameId, currentPlayer.id);
  break;
```

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function handleJoinGameCommand(gameId, playerId) {
  let result;

  try {
    result = gameController.joinGame(gameId, playerId);
    logger.info(`Player ${playerId} joined game ${gameId}`);
  } catch (err) {
    return handleError(playerId, err);
  }

  sendMessageToPlayer(playerId, {
    resource: 'game',
    command: 'startGame',
    params: {
      game: result.game
    }
  });

  for (const player of gameManager.players) {
    sendMessageToPlayer(player.id, {
      resource: 'game',
      command: 'removeJoinableGame',
      params: {
        gameId: result.game.id
      }
    });
  }
}
```



## Frontend: handle the `removeJoinableGame` command

```js
case 'removeJoinableGame':
  handleRemoveJoinableGameCommand(params.gameId);
  break;
```

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function handleRemoveJoinableGameCommand(gameId) {
  viewManager.removeJoinableGame(gameId);
}
```



## Implement the rest

```js
viewManager.on('play', (col, row) => onBoardClicked(ws, col, row));
viewManager.on('leaveGame', () => onLeaveGameClicked(ws));
```



[ws]: https://en.wikipedia.org/wiki/WebSocket
[ws-npm]: https://www.npmjs.com/package/ws
[ws-object]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
[ws-server]: https://www.npmjs.com/package/ws#simple-server