# Implementing tic-tac-toe with WebSockets

In this variant of the exercise, you will use the [WebSocket protocol][ws] to
implement the communications between the tic-tac-toe backend and frontend.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Tips

* Open browser developer console
* Reload the browser page after each step, check backend & frontend logs



## Backend: set up a WebSocket server

```bash
$> npm install ws
```

```js
const WebSocket = require('ws');
```

```js
// COMMUNICATIONS
// ==============

const wss = new WebSocket.Server({
  server,
  perMessageDeflate: false
});

wss.on('connection', function(ws) {
  logger.info('New WebSocket client connected');
});
```



## Frontend: connect to the backend

```js
const WebSocket = require('ws');
```

```js
// COMMUNICATIONS
// ==============

const WS_URL = `ws://${window.location.hostname}:${window.location.port}`;
const ws = new WebSocket(WS_URL);

ws.onopen = function() {
  console.log(`Connected to WebSockets server at ${WS_URL}`);
};
```



## Backend: create a tic-tac-toe player for each new WebSocket client

```js
// SETUP
// =====

// <previous code here...>

const clients = {};
```

```js
// Create a player for each newly connected client.
const newPlayer = playerController.createPlayer();
logger.info(`Player ${newPlayer.id} created`);

// Store a mapping between the new player's ID and the WebSockets client.
clients[newPlayer.id] = ws;

// Forget the mapping when the client disconnects.
ws.on('close', function() {
  logger.info(`Player ${newPlayer.id} disconnected`);
  gameManager.removePlayer(newPlayer.id);
  delete clients[newPlayer.id];
});
```



## Backend: send the `setPlayer` command to newly connected clients

```js
// SETUP
// =====

// <previous code here...>

function sendMessageToPlayer(playerId, message) {
  const client = clients[playerId];
  if (client) {
    client.send(JSON.stringify(message));
  }
}
```

```json
{
  "resource": "<game|player>",
  "command": "<command>",
  "params": {
    "<key>": "<value>"
  }
}
```

```js
// Send the player to the client.
sendMessageToPlayer(newPlayer.id, {
  resource: 'player',
  command: 'setPlayer',
  params: {
    player: newPlayer
  }
});
```



## Frontend: dispatch the `setPlayer` command

```js
// SETUP
// =====

let currentPlayer;
```

```js
// Dispatch server messages.
ws.onmessage = function(message) {

  console.log(`Received message from server: ${message.data}`);
  const payload = JSON.parse(message.data);

  /**
   * Message payload format:
   * {
   *   "resource": "<game|player>".
   *   "command": "<command>",
   *   "params": {
   *     "<key>": "<value>"
   *   }
   * }
   */
  switch (payload.resource) {
    case 'player':
      dispatchPlayerCommand(payload.command, payload.params);
      break;
  }
};
```

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

```js
// PLAYER MANAGEMENT
// =================

// <previous code here...>

function handleSetPlayerCommand(player) {
  currentPlayer = player;
  console.log(`Player ID is ${currentPlayer.id}`);
}
```



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



## Backend: dispatch the `createGame` command, send the `startGame` command

```js
// Receive and dispatch messages from clients.
ws.on('message', msg => {

  logger.debug(`New client message: ${msg}`);
  const msgData = JSON.parse(msg);

  switch (msgData.resource) {
    case 'game':
      dispatchGameCommand(msgData.command, msgData.params, newPlayer);
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

// <previous code here...>

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

// <previous code here...>

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



## Frontend: dispatch the `startGame` command

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

// <previous code here...>

let currentGame;

function handleError(message) {
  viewManager.displayToast(message);
}
```

```js
// GAME MANAGEMENT
// ===============

// <previous code here...>

function handleStartGameCommand(game) {
  currentGame = game;
  viewManager.displayGame(game, currentPlayer);
}
```



## Backend: dispatch the `addJoinableGames` command

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



## Frontend: dispatch the `addJoinableGames` command

```js
case 'addJoinableGames':
  handleAddJoinableGamesCommand(params.games);
  break;
```

```js
// GAME MANAGEMENT
// ===============

// <previous code here...>

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

// <previous code here...>

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



## Backend: dispatch the `joinGame` command, send the `startGame` and `removeJoinable` commands

```js
case 'joinGame':
  handleJoinGameCommand(params.gameId, currentPlayer.id);
  break;
```

```js
// GAME MANAGEMENT
// ===============

// <previous code here...>

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



## Frontend: dispatch the `removeJoinableGame` command

```js
case 'removeJoinableGame':
  handleRemoveJoinableGameCommand(params.gameId);
  break;
```

```js
// GAME MANAGEMENT
// ===============

// <previous code here...>

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