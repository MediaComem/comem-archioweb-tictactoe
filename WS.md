# Implementing tic-tac-toe with WebSockets

In this variant of the exercise, you will use the [WebSocket protocol][ws] to
implement the communications between the tic-tac-toe backend and frontend.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Tips](#tips)
- [Backend: set up a WebSocket server](#backend-set-up-a-websocket-server)
- [Frontend: open a WebSocket connection to the backend](#frontend-open-a-websocket-connection-to-the-backend)
- [Backend: create a tic-tac-toe player for each new WebSocket client](#backend-create-a-tic-tac-toe-player-for-each-new-websocket-client)
- [Backend: send created players to their respective clients](#backend-send-created-players-to-their-respective-clients)
- [Frontend: dispatch backend messages and store the created player](#frontend-dispatch-backend-messages-and-store-the-created-player)
- [Frontend: implement the Create Game button](#frontend-implement-the-create-game-button)
- [Backend: create and start tic-tac-toe games](#backend-create-and-start-tic-tac-toe-games)
- [Frontend: display started games](#frontend-display-started-games)
- [Backend: notify frontend clients that new games can be joined](#backend-notify-frontend-clients-that-new-games-can-be-joined)
- [Frontend: display joinable games](#frontend-display-joinable-games)
- [Frontend: request to join a game](#frontend-request-to-join-a-game)
- [Backend: make players join existing games](#backend-make-players-join-existing-games)
- [Frontend: handle the `removeJoinableGame` command](#frontend-handle-the-removejoinablegame-command)
- [Backend & frontend: implement the rest](#backend--frontend-implement-the-rest)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Tips

* **Keep your browser's developer console open** throughout this exercise to see
  messages and errors logged by the frontend client.
* Each step introduces a small bit of functionality which can usually be tested
  after refreshing your browser. Keep an eye on your browser's developer console
  and on the terminal where your are running the backend. Various **messages
  will be logged** to indicate what is happening.
* **Edit the correct file:** when a step is titled **Backend: ...**, it means
  that you must edit the `app/backend/dispatcher.js` file. Conversely, when a
  step is titled **Frontend: ...**, you must edit the
  `app/frontend/dispatcher.js` file.
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



## Frontend: open a WebSocket connection to the backend

You do not need to import the `ws` package in the frontend, since the
`WebSocket` object is natively available in a browser's environment (as long as
you use a modern browser).

You now want the frontend to open a WebSocket connection to the backend. Since
frontend files are served by the backend, the URL of the backend is simply the
current browser's location. Connecting to it is as simple as instantiating a
[`WebSocket` object][ws-object] with the correct URL.

**Add the following code to the `COMMUNICATIONS` section**:

```js
// COMMUNICATIONS
// ==============

// Open a WebSocket connection to the backend.
const wsProtocol = window.location.protocol.startsWith('https') ? 'wss' : 'ws';
const wsUrl = `${wsProtocol}://${window.location.hostname}:${window.location.port}`;
const ws = new WebSocket(wsUrl);
```

The documentation of the `WebSocket` object states that it emit a number of
events and that you can [listen to these events using the `addEventListener`
method][ws-object-events]. Notably, it will emit the `open` event as soon as it
has successfully opened the WebSocket connection.

**Add the following code to the `COMMUNICATIONS` section**:

```js
// COMMUNICATIONS
// ==============

// <PREVIOUS CODE HERE...>

ws.addEventListener('open', function() {
  console.log(`Connected to WebSocket server at ${WS_URL}`);
});
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

Every time a client connects, you want to create a player and store the
WebSocket client in the `clients` map. The provided `PlayerController` class has
a [`createPlayer` method][player-controller-create-player] that will handle
creating the player for you. **Add the following code to the
`wss.on('connection')` callback in the `COMMUNICATIONS` section**:

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



## Backend: send created players to their respective clients

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



## Frontend: dispatch backend messages and store the created player

The frontend must now be able to handle the `setPlayer` command. You will need
to store the newly created player. Storing it in memory is sufficient for the
purposes of this exercise, so you can simply **add the following declaration to
the `SETUP` section**:

```js
// SETUP
// =====

let currentPlayer;
```

To handle commands, you must first receive the backend's messages. The
`WebSocket` object's `message` event is emitted every time a message is
received. **Add the following code to the `ws.addEventListener('open')` callback
in the `COMMUNICATIONS` section**:

```js
ws.addEventListener('open', function() {
  // <PREVIOUS CODE HERE...>

  // Dispatch backend messages.
  ws.addEventListener('message', function(message) {

    console.log(`Received message from the backend: ${message.data}`);
    const messageData = JSON.parse(message.data);
  });
});
```

> Note that the message data that was encoded by the backend with
> `JSON.stringify` is now decoded on the frontend with `JSON.parse`.

Refresh your browser and **you should see backend messages being logged** in the
developer console as they are received.

Messages from the backend are now being received and decoded, but have yet to be
handled. Since you have a well-defined message format, you can dispatch the
handling of these messages to separate functions to limit complexity.

**Add the following code to the `ws.addEventListener('message')` callback in the
`COMMUNICATIONS` section**:

```js
// Dispatch server messages.
ws.addEventListener('message', function(message) {
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
});
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



## Frontend: implement the Create Game button

The backend/frontend interaction you implemented so far has been automatic and
transparent, not visible to the user. It is time to start reacting to user
actions.

If you look at the documentation of the `ViewManager` class, you will see that
emit events and that you can [listen to these events with its `on`
method][view-manager-on]. The `createGame` event is emitted when the user clicks
on the Create Game button. Let's react to that.

**Add the following code to the `ws.addEventListener('open')` callback in the
`COMMUNICATIONS` section**:

```js
ws.addEventListener('open', function() {
  // <PREVIOUS CODE HERE...>

  // Handle DOM events.
  viewManager.on('createGame', () => onCreateGameClicked(ws));
});
```

Instead of writing the event handling code directly in the connection callback,
it is good practice to dispatch that to a separate function. You must now
implement this `onCreateGameClicked` function.

The backend server cannot detect clicks in the frontend client running in the
browser, so you need to tell the backend that a new tic-tac-toe game must be
created by sending a WebSocket message. Let's send a new `createGame` command to
the backend with our standard message format.

**Add the following code to the `GAME MANAGEMENT` section**:

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

> Note that `ws`, the WebSocket client instance, is passed to the
> `onCreateGameClicked` function as an argument so that it can use its [`send`
> method][ws-object-send] to send a message to the server. Again, the message
> data is serialized as JSON.

Refresh your browser and click the Create Game button. **You should see the new
message being sent in the WebSocket connection** in the developer console's
Network tab.



## Backend: create and start tic-tac-toe games

Since the backend is now receiving WebSocket messages, you should add code to
handle them. As indicated by the documentation of the `ws` package, [you can
listen to the `message` event to receive incoming messages][ws-server].

**Add the following code to the `wss.on('connection')` callback in the
`COMMUNICATIONS` section**:

```js
// Handle new client connections.
wss.on('connection', function(ws) {
  // <PREVIOUS CODE HERE...>

  // Receive and dispatch messages from clients.
  ws.on('message', function(message) {

    logger.debug(`New client message: ${message}`);
    const messageData = JSON.parse(message);
  });
});
```

If you refresh your browser and click the Create Game button again, you should
now see the message being logged in the terminal where you are running the
backend.

Since the messages received by the backend are also in your standard message
format, you should dispatch them to separate functions as well. **Add the
following code to the `ws.on('message')` callback you just added in the
`COMMUNICATIONS` section:

```js
// Receive and dispatch messages from clients.
ws.on('message', function(message) {
  // <PREVIOUS CODE HERE...>

  switch (messageData.resource) {
    case 'game':
      dispatchGameCommand(messageData.command, messageData.params, newPlayer);
      break;
  }
});
```

As in the frontend, implement the `dispatchGameCommand` function to separate
handling of messages by resource. **Add the following code to the `GAME
MANAGEMENT` section**:

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

Finally, the `handleCreateGameCommand` function will handle the `createGame`
command itself. The provided `GameController` class has a [`createNewGame`
method][game-controller-create-new-game] that will create the game for you.

Once that's done, you need to send a new message to the frontend client to
notify it that the game can be started. Let's send a new `startGame` command
with the created game as a parameter.

**Add the following code to the `GAME MANAGEMENT` section**:

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

  // Tell the frontend client to start the game.
  sendMessageToPlayer(playerId, {
    resource: 'game',
    command: 'startGame',
    params: {
      game: newGame
    }
  });
}
```

This code uses a new `handleError` function which you do not have yet. Its
purpose is to notify the frontend client of any error that might occur while
creating or running tic-tac-toe games. Game errors thrown by the
`GameController` are instances of the [`GameError` class][game-error], which
have a `code` property identifying the error and a human-readable `message`
property.

Let's define a new `error` command to send this information to the frontend
client. **Add the following code to the `SETUP` section**:

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



## Frontend: display started games

Two new commands are now being sent from the backend to the frontend:
`startGame` and `error`. **Add the following code to the `GAME MANAGEMENT`
section** to dispatch them:

```js
// GAME MANAGEMENT
// ===============

function dispatchGameCommand(command, params) {
  switch (command) {
    case 'error':
      handleError(params.message, params.code);
      break;
    case 'startGame':
      handleStartGameCommand(params.game);
      break;
  }
}
```

When an `error` command is received, you probably want to notify the user and
log a message in the console for developers. **Add the following code to the
`SETUP` section:**

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

function handleError(message, code) {
  console.warn(`ERROR: received error code ${code} from backend`);
  viewManager.displayToast(message);
}
```

Before handling the `startGame` command, you will need to store the current game
once it has started. Again, storing it in memory is sufficient for the purposes
of this exercise. **Add the following declaration to the `SETUP` section**:

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

let currentGame;
```

You are now ready to store and start the game with the `handleStartGameCommand`
function. The provided `ViewManager` has a [`displayGame`
method][view-manager-display-game] that will display the game in the user
interface. **Add the following code to the `GAME MANAGEMENT` section**:

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function handleStartGameCommand(game) {
  currentGame = game;
  viewManager.displayGame(game, currentPlayer);
}
```

Refresh your browser and **you should now be able to start a tic-tac-toe game**
by clicking on the Create Game button.



## Backend: notify frontend clients that new games can be joined

Starting a tic-tac-toe game is all well and good, but you need an opponent to
face you in battle!

In order to join a game, your opponent must know it exists. Let's define a new
`addJoinableGames` command that the backend can send to the frontend with a list
of games that can be joined. There are 2 times a frontend client needs to be
notified of new joinable games: when it first connects, and every time a new
game is created.

The provided `GameController` has a [`getJoinableGames`
method][game-controller-get-joinable-games] that gives you the list of currently
joinable games. **Add the following code to the `wss.on('connection')` callback
in the `COMMUNICATIONS` section** to send them to new clients:

```js
// Handle new client connections.
wss.on('connection', function(ws) {
  // <PREVIOUS CODE HERE...>

  // Send currently joinable games to the client.
  sendMessageToPlayer(newPlayer.id, {
    resource: 'game',
    command: 'addJoinableGames',
    params: {
      games: gameController.getJoinableGames()
    }
  });
});
```

**Add the following code to the `handleCreateGameCommand` in the `GAME
MANAGEMENT` section** to notify players in real-time when a new game is
available:

```js
function handleCreateGameCommand(playerId) {
  // <PREVIOUS CODE HERE...>

  // Tell all other frontend clients that a new joinable game is available.
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
}
```

> Note the `if (player.id !== playerId)` condition. When a player starts a game,
> you only need to notify other players that a new game can be joined. The
> player who created the game will already be in it.



## Frontend: display joinable games

**Add the following case to the switch in the `dispatchGameCommand` function in
the `GAME MANAGEMENT` section** to dispatch the new `addJoinableGames` command
from the backend:

```js
case 'addJoinableGames':
  handleAddJoinableGamesCommand(params.games);
  break;
```

The `ViewManager` class has an [`addJoinableGame`
method][view-manager-add-joinable-game] that can be used to display a new game
in the interface. **Add the following function to the `GAME MANAGEMENT`
section** to display the games sent in the `addJoinableGames` command:

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

Refresh your browser window and open a new one. **You will now need 2 browser
windows to test the application**, since you need 2 players.

Create a game in window 1 and **you should see it appear in real time** in
window 2. If you refresh window 2, **you should also be able to see the game
appear as the client first connects**.



## Frontend: request to join a game

For your opponent to join the game, he or she will click on the Join Game
button. The `ViewManager` will emit a `joinGame` event with the game ID when
that occurs. **Add the following code to the `ws.addEventListener('open')`
callback** to listen to that event:

```js
ws.addEventListener('open', function() {
  // <PREVIOUS CODE HERE...>

  viewManager.on('joinGame', gameId => onJoinGameClicked(ws, gameId));
});
```

The backend must be notified that a player wants to join the game. **Add the
following function to the `GAME MANAGEMENT` section** to send a new `joinGame`
command to the backend:

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



## Backend: make players join existing games

**Add the following case to the switch in the `dispatchGameCommand` function in
the `GAME MANAGEMENT` section** to dispatch the new `joinGame` command from the
frontend:

```js
case 'joinGame':
  handleJoinGameCommand(params.gameId, currentPlayer.id);
  break;
```

The provided `GameController` has a [`joinGame`
method][game-controller-join-game] you can use to make the player join the game.

When an opponent joins a game, 2 things need to happen: the game interface needs
to show up for the opponent, and the game needs to be removed from the list of
joinable games for other players. You already have the `startGame` command for
the former, but you will need a new `removeJoinableGame` command for the latter.

**Add the following function to the `GAME MANAGEMENT` section**:

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

  // Tell the frontend client to start the game.
  sendMessageToPlayer(playerId, {
    resource: 'game',
    command: 'startGame',
    params: {
      game: result.game
    }
  });

  // Tell all frontend clients that the game is no longer joinable.
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

Refresh both your browser windows and **you should now be able to create a game
in window 1 and join it in window 2**.



## Frontend: handle the `removeJoinableGame` command

**Add the following case to the switch in the `dispatchGameCommand` function in
the `GAME MANAGEMENT` section** to dispatch the new `removeJoinableGame`
command:

```js
case 'removeJoinableGame':
  handleRemoveJoinableGameCommand(params.gameId);
  break;
```

The provided `ViewManager` class has a [`removeJoinable`
game][view-manager-remove-joinable-game] that does the opposite of the
`addJoinableGame` method: it removes a game from the list. **Add the following
function to the `GAME MANAGEMENT` section**:

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function handleRemoveJoinableGameCommand(gameId) {
  viewManager.removeJoinableGame(gameId);
}
```

Refresh both your browser windows. To test this, you need a third browser
window. Create a game in window 1, **you should see it appear in both windows 2
and 3**. Join the game in window 2, and **you should see it disappear from
window 3** as it is no longer joinable.



## Backend & frontend: implement the rest

The rest of the functionality is yours to implement.

There are 2 DOM events that are not yet handled:

* During a game, the `play` event is emitted when the player clicks on the
  board. The column (0-2 from left to right) and row (0-2 from top to bottom)
  identifying the board cell are provided.

  You need to listen to this event and handle it with a new game management
  function:

  ```js
  viewManager.on('play', (col, row) => onBoardCellClicked(ws, col, row));
  ```
* During a game, the `leaveGame` event is emitted when the player clicks on the
  Leave Game button.

  You need to listen to this event and handle it with a new game management
  function:

  ```js
  viewManager.on('leaveGame', () => onLeaveGameClicked(ws));
  ```

You will probably need to define new commands for these actions and send them to
the backend. Then you need to dispatch and handle those commands in the backend.

For the backend, look at the documentation of the [`GameController`
class][game-controller] and see what methods you need to call to handle the new
commands.

The backend will probably also need to send new commands to the frontend once
the actions have been performed.



[game-controller]: https://mediacomem.github.io/comem-archioweb-tictactoe/GameController.html
[game-controller-create-new-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/GameController.html#createNewGame
[game-controller-get-joinable-games]: https://mediacomem.github.io/comem-archioweb-tictactoe/GameController.html#getJoinableGames
[game-controller-join-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/GameController.html#joinGame
[game-error]: https://mediacomem.github.io/comem-archioweb-tictactoe/GameError.html
[player-controller-create-player]: https://mediacomem.github.io/comem-archioweb-tictactoe/PlayerController.html#createPlayer
[view-manager-add-joinable-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/ViewManager.html#addJoinableGame
[view-manager-display-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/ViewManager.html#displayGame
[view-manager-on]: https://mediacomem.github.io/comem-archioweb-tictactoe/ViewManager.html#on
[view-manager-remove-joinable-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/ViewManager.html#removeJoinableGame
[ws]: https://en.wikipedia.org/wiki/WebSocket
[ws-npm]: https://www.npmjs.com/package/ws
[ws-object]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
[ws-object-events]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#Events
[ws-object-send]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
[ws-server]: https://www.npmjs.com/package/ws#simple-server