# Implementing tic-tac-toe with the Web Application Messaging Protocol (WAMP)

In this variant of the exercise, you will use the [Web Application Messaging
Protocol (WAMP)][wamp] to implement the communications between the tic-tac-toe
backend and frontend.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- END doctoc generated TOC please keep comment here to allow auto update -->



## Tips

* Open browser developer console
* Reload the browser page after each step, check backend & frontend logs



## Set up a WAMP router

...



## Backend & frontend: connect to the WAMP router

```js
// COMMUNICATIONS
// ==============

const connection = new autobahn.Connection({
  url: 'wss://wamp.example.com/ws',
  realm: 'example'
  authid: 'jdoe',
  authmethods: [ 'ticket' ],
  onchallenge: function() {
    return 'changeme';
  }
});

connection.onopen = function(session) {
  logger.info('Connection to WAMP router established');
};

connection.open();
```



## **CHOOSE YOUR NAMESPACE**

...



## Backend: register the `initPlayer` procedure

```js
session.register('ch.comem.archioweb.tictactoe.initPlayer', () => initPlayer());
```

```js
// PLAYER MANAGEMENT
// =================

function initPlayer() {

  const player = playerController.createPlayer();
  logger.info(`Initialized player ${player.id}`);

  return {
    player,
    games: gameController.getJoinableGames()
  };
}
```



## Frontend: call the `initPlayer` procedure after connecting to the router

```js
// SETUP
// =====

let currentPlayer;

function handleError(err) {
  viewManager.displayToast('An unexpected error occurred');
}
```

```js
session.call('ch.comem.archioweb.tictactoe.initPlayer', []).then(result => {

  currentPlayer = result.player;
  console.log(`Player ID is ${result.player.id}`);

  for (const game of result.games) {
    onJoinableGameAdded(game);
  }
}).catch(handleError);
```

```js
// GAME MANAGEMENT
// ===============

function onJoinableGameAdded(game) {
  viewManager.addJoinableGame(game);
}
```



## Backend: register the `createGame` procedure

```js
session.register('ch.comem.archioweb.tictactoe.createGame', (args, params) => createGame(session, params.playerId));
```

```js
// GAME MANAGEMENT
// ===============

function createGame(session, playerId) {
  let newGame;

  try {
    newGame = gameController.createNewGame(playerId);
    logger.info(`Player ${playerId} created game ${newGame.id}`);
  } catch (err) {
    return handleError(err);
  }

  return newGame;
}
```

```js
function handleError(err) {
  if (err instanceof GameError) {
    throw new autobahn.Error('ch.comem.archioweb.tictactoe.gameError', [], { code: err.code, message: err.message });
  } else {
    throw err;
  }
}
```



## Frontend: update the `handleError` function to recognize game-related errors

```js
function handleError(err) {
  if (err.error === 'ch.comem.archioweb.tictactoe.gameError') {
    viewManager.displayToast(err.kwargs.message);
  } else {
    viewManager.displayToast('An unexpected error occurred');
  }
}
```



## Frontend: call the `createGame` procedure when the user clicks on the Create Game button

```js
viewManager.on('createGame', () => onCreateGameClicked(session));
```

```js
// GAME MANAGEMENT
// ===============

// <previous code here...>

function onCreateGameClicked(session) {
  if (!currentPlayer) {
    return viewManager.displayToast('No player information available');
  }

  session.call('ch.comem.archioweb.tictactoe.createGame', [], { playerId: currentPlayer.id }).then(newGame => {
    startGame(session, newGame, currentPlayer);
  }).catch(handleError);
}
```

```js
// SETUP
// =====

// <previous code here...>

let currentGame;
```

```js
// GAME MANAGEMENT
// ===============

// <previous code here...>

function startGame(session, game, player) {
  currentGame = game;
  viewManager.displayGame(game, player);
}
```



## Backend: publish the `joinableGames.added` event

```js
session.publish('ch.comem.archioweb.tictactoe.joinableGames.added', [], { game: newGame });
```



## Frontend: subscribe to the `joinableGames.added` event

```js
session.subscribe('ch.comem.archioweb.tictactoe.joinableGames.added', (args, params) => onJoinableGameAdded(params.game));
```

```js
// GAME MANAGEMENT
// ===============

// <previous code here...>

function onJoinableGameAdded(game) {
  viewManager.addJoinableGame(game);
}
```



## Backend: register the `joinGame` procedure

```js
session.register('ch.comem.archioweb.tictactoe.joinGame', (args, params) => joinGame(session, params.gameId, params.playerId));
```

```js
// GAME MANAGEMENT
// ===============

// <previous code here...>

function joinGame(session, gameId, playerId) {
  let result;

  try {
    result = gameController.joinGame(gameId, playerId);
    logger.info(`Player ${playerId} joined game ${gameId}`);
  } catch (err) {
    return handleError(err);
  }

  return result;
}
```



## Frontend: call the `joinGame` procedure when the user clicks the Join Game button

```js
viewManager.on('joinGame', gameId => onJoinGameClicked(session, gameId, currentPlayer.id));
```

```js
function onJoinGameClicked(session, gameId, playerId) {
  session.call('ch.comem.archioweb.tictactoe.joinGame', [], { gameId, playerId }).then(result => {
    startGame(session, result.game, currentPlayer);
  }).catch(handleError);
}
```



## Backend: publish the `joinableGames.removed` event when a game starts

```js
session.publish('ch.comem.archioweb.tictactoe.joinableGames.removed', [], { gameId });
```



## Frontend: subscribe to the `joinableGames.removed` event

```js
session.subscribe('ch.comem.archioweb.tictactoe.joinableGames.removed', (args, params) => onJoinableGameRemoved(params.gameId));
```

```js
function onJoinableGameRemoved(gameId) {
  viewManager.removeJoinableGame(gameId);
}
```



[wamp]: https://wamp-proto.org