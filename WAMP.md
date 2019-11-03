# Implementing tic-tac-toe with the Web Application Messaging Protocol (WAMP)

In this variant of the exercise, you will use the [Web Application Messaging
Protocol (WAMP)][wamp] to implement the communications between the tic-tac-toe
backend and frontend.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Tips](#tips)
- [Set up a WAMP router](#set-up-a-wamp-router)
  - [Configure an authentication secret](#configure-an-authentication-secret)
- [Backend & frontend: connect to the WAMP router](#backend--frontend-connect-to-the-wamp-router)
- [Configure your namespace](#configure-your-namespace)
- [Backend: register a procedure to initialize a player](#backend-register-a-procedure-to-initialize-a-player)
- [Frontend: call the player registration procedure after connecting to the router](#frontend-call-the-player-registration-procedure-after-connecting-to-the-router)
- [Backend: register a procedure to create a new tic-tac-toe game](#backend-register-a-procedure-to-create-a-new-tic-tac-toe-game)
- [Frontend: update the error handling function to recognize game-related errors](#frontend-update-the-error-handling-function-to-recognize-game-related-errors)
- [Frontend: call the game creation procedure when the user clicks on the Create Game button](#frontend-call-the-game-creation-procedure-when-the-user-clicks-on-the-create-game-button)
- [Backend: publish an event to notify players that a new game can be joined](#backend-publish-an-event-to-notify-players-that-a-new-game-can-be-joined)
- [Frontend: subscribe to the event to display new joinable games](#frontend-subscribe-to-the-event-to-display-new-joinable-games)
- [Backend: register a procedure to join a game](#backend-register-a-procedure-to-join-a-game)
- [Frontend: call the `joinGame` procedure when the user clicks the Join Game button](#frontend-call-the-joingame-procedure-when-the-user-clicks-the-join-game-button)
- [Backend: publish the `joinableGameRemoved` event when a game starts](#backend-publish-the-joinablegameremoved-event-when-a-game-starts)
- [Frontend: subscribe to the `joinableGameRemoved` event](#frontend-subscribe-to-the-joinablegameremoved-event)
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



## Set up a WAMP router

This variant of the exercise requires a running WAMP router to connect both the
backend and frontend to. You will need:

* The WebSocket **URL of the router**, e.g. `wss://wamp.example.com/ws`.
* The **name of the realm** to connect to, e.g. `realm1`.
* If authentication is required, you will also need:
  * An **authentication ID**, i.e. your identity.
  * The list of allowed **authentication methods** such as `ticket` or `wampcra`
    (see [Crossbar.io Authentication][crossbar-auth]).
  * A **secret** of some kind depending on the authentication method, such as a
    ticket for `ticket` authentication, or a shared secret for `wampcra`.

> If a router was not provided to you, you can [run one yourself with
> Docker][crossbar-docker]. With the default settings, your router URL will be
> `ws://localhost:8080/ws` and the default realm will be `realm1`, with no
> authentication required.



### Configure an authentication secret

*If your WAMP router requires authentication*, you will need to inject a secret
value into the backend and frontend. Create a `.env` file at the root of the
repository with the following contents (replace `changeme` with the actual
secret):

```
TICTACTOE_WAMP_AUTH_SECRET=changeme
```

> The value of this variable is already available in both the backend and
> frontend dispatcher files in the `secret` variable.
>
> The variables in the `.env` file are automatically loaded into environment
> variables in the backend using the [dotenv][dotenv] package. As for the
> frontend, specific variables are injected into the build using [WebPack's
> Define Plugin][webpack-define-plugin] (see the
> [`webpack.config.js`](webpack.config.js) file).

Stop and restart the `npm run start:watch` command to take this change into
account.



## Backend & frontend: connect to the WAMP router

**Install the [`autobahn` package][autobahn]**, the most full-featured WAMP
client library developed by the authors of the WAMP specification:

```bash
$> npm install autobahn
```

To use it in the backend's Node.js code, you need to import it. **Add this
statement at the top of the `app/backend/dispatcher.js` file**:

```js
const autobahn = require('autobahn');
```

To use it in the frontend's JavaScript code, **add this statement at the top of
the `app/frontend/dispatcher.js` file**:

```js
import autobahn from 'autobahn';
```

You are not in a classic client-server model with WAMP. All components using
WAMP are clients and connect to the central WAMP router. This means that both
the tic-tac-toe backend and frontend must connect to the router, and can use the
same code to do it.

The documentation of the `autobahn` package [explains how to open a connection
to a router][autobahn-connections]. **Add the following code to the
`COMMUNICATIONS` section of both the backend and frontend dispatchers (adapt
`url` and `realm` properties to match your WAMP router's configuration)**:

```js
// COMMUNICATIONS
// ==============

const connection = new autobahn.Connection({
  url: 'wss://wamp.example.com/ws',
  realm: 'tictactoe'
  authid: 'tictactoe',
  authmethods: [ 'ticket' ],
  onchallenge: function() {
    return secret;
  }
});

connection.onopen = function(session) {
  logger.info('Connection to WAMP router established');
};

connection.open();
```

> This example assumes that your WAMP router is configured with [ticket
> authentication][crossbar-auth-ticket]. If your WAMP router does not require
> authentication, you can remove the `authid`, `authmethods` and `onchallenge`
> properties.

Refresh your browser window and **you should see the connection to the WAMP
router being established from the frontend** in the developer console. **You
should also see the connection being established from the backend** in the
terminal where you are running it.

Both the tic-tac-toe backend and frontend are now ready to use WAMP.



## Configure your namespace

With WAMP, you will register named procedures and publish events on named
topics. You must uniquely name each procedure and topic so that there is no
collision, *especially if multiple people are connecting to the same WAMP router
to perform the exercise*.

To avoid this problem, define a unique namespace that you will use as a prefix
in all your procedure and topic names. You may set your namespace by adding the
following line to your `.env` file at the root of the repository (replacing
`<YOURNAME>` with your actual name):

```
TICTACTOE_NAMESPACE=ch.comem.archioweb.tictactoe.<YOURNAME>
```

> Using a [reverse DNS notation][reverse-dns] is a good way to avoid naming
> collisions, since presumably no one else would use your domain.
>
> The value of this variable is already available in both the backend and
> frontend dispatchers in the `namespace` variable.

Stop and restart the `npm run start:watch` command to take this change into
account.



## Backend: register a procedure to initialize a player

You are now ready to register your first WAMP procedure.

In order for a user to play the game, the backend must register a new player.
The provided `PlayerController` class has a [`createPlayer`
method][player-controller-create-player] that will handle creating the player
for you. Let's write an `initPlayer` function that does the job.

**Add the following code to the `PLAYER MANAGEMENT` section**:

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

> In addition to creating a player, note that this function also returns the
> list of games that are currently available to join. This will be useful later.

The backend must now register this procedure in the WAMP router, performing the
role of Callee (the frontend will later be the Caller). The documentation of the
`autobahn` package explains [how to register a procedure][autobahn-register].

**Add the following code to the `connection.onopen` callback in the
`COMMUNICATIONS` section**

```js
connection.onopen = function(session) {
  // <PREVIOUS CODE HERE...>
  session.register(`${namespace}.initPlayer`, () => initPlayer()).catch(onRegistrationFailure);
};
```

> Note that the procedure is named `${namespace}.initPlayer`, meaning that if
> your namespace is `ch.comem.archioweb.tictactoe`, the full name of the
> procedure will be `ch.comem.archioweb.tictactoe.initPlayer`.

In order for this call to work, you also need to implement the
`onRegistrationFailure` function, which will be called if the registration
cannot be performed for some reason. This should be a fatal error, since your
backend will not work correctly if it cannot register one of its procedures.

**Add the following code to the `SETUP` section**:

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

function onRegistrationFailure(err) {
  logger.fatal(err);
  process.exit(1);
}
```

The `initPlayer` procedure is now ready to be called by any WAMP client
connected to the same realm on the same router.



## Frontend: call the player registration procedure after connecting to the router

The frontend must now call the `initPlayer` procedure as soon as it connects to
the WAMP router. You will need to store the newly created player. Storing it in
memory is sufficient for the purposes of this exercise, so you can simply **add
the following declaration to the `SETUP` section**:

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

let currentPlayer;
```

Calling a procedure can fail (there could be a bug in the backend, or the
connection might be dropped), so you need an error handling function. **Add the
following code to the `SETUP` section** to display a message to the user when an
error occurs:

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>
function handleError(err) {
  viewManager.displayToast('An unexpected error occurred');
}
```

You can now call the `initPlayer` procedure. The documentation of the `autobahn`
package explains [how to do that][autobahn-call].

Note that when calling a procedure, you may provide:

* An **array or aguments**:

  ```js
  session.call('procedureName', [ 'arg1', 'arg2' ]);
  ```
* Or an **object of arguments**:

  ```js
  session.call('procedureName', [], { key1: 'value1', key2: 'value2' });
  ```

In this guide, we suggest always using an object for consistency. **Add the
following code to the `connection.onopen` callback in the `COMMUNICATIONS`
section**:

```js
connection.onopen = function(session) {
  // <PREVIOUS CODE HERE...>

  // Initialize a player once connected to the router.
  session.call(`${namespace}.initPlayer`, [], {}).then(result => {

    currentPlayer = result.player;
    console.log(`Player ID is ${result.player.id}`);

    for (const game of result.games) {
      onJoinableGameAdded(game);
    }
  }).catch(handleError);
};
```

> Note that `session.call` is asynchronous and returns a [Promise][promise]. The
> result is therefore available in the `.then` callback, or the `.catch`
> callback will be called if an error occurs.

In order for this call to work, you also need to implement the
`onJoinableGameAdded` function to add games to the displayed list of joinable
games in the interface. **Add the following code to the `GAME MANAGEMENT`
section**:

```js
// GAME MANAGEMENT
// ===============

function onJoinableGameAdded(game) {
  viewManager.addJoinableGame(game);
}
```

Refresh your browser and you should see the procedure being called:

* **The backend should log that it has initialized a player** in the terminal
  where you are running it.
* **The frontend should log that it has received a player ID** in your browser's
  developer console.



## Backend: register a procedure to create a new tic-tac-toe game

In order for players to play the game, the backend must create new games. Let's
register a new `createGame` procedure to do that. **Add the following code to
the `connection.onopen` callback in the `COMMUNICATIONS` section**

```js
connection.onopen = function(session) {
  // <PREVIOUS CODE HERE...>
  session.register(`${namespace}.createGame`, (args, params) => createGame(session, params.playerId)).catch(onRegistrationFailure);
};
```

The provided `GameController` class has a [`createNewGame`
method][game-controller-create-new-game] that will create the game for you.
**Add the following code to the `GAME MANAGEMENT` section** to implement the
procedure:

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

This code uses a new `handleError` function which you do not have yet. Its
purpose is to notify the Caller of any error that might occur while executing a
procedure. Game errors thrown by the `GameController` are instances of the
[`GameError` class][game-error], which have a `code` property identifying the
error and a human-readable `message` property.

The `autobahn` package provides [error handling functionality][autobahn-errors].
Notably, by throwing an instance of the `autobahn.Error` class, we can send
detailed error information to the Caller.

**Add the following code to the `SETUP` section** to handle procedure errors:

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

function handleError(err) {
  if (err instanceof GameError) {
    // Send game error details to the Caller if this is a game-related error.
    throw new autobahn.Error(`${namespace}.gameError`, [], { code: err.code, message: err.message });
  } else {
    throw err;
  }
}
```

The `createGame` procedure is now ready to be called by other WAMP clients.



## Frontend: update the error handling function to recognize game-related errors

Since the backend is now sending detailed error information when a game-related
error occurs, you must **update the `handleError` function in the `SETUP`
section** to extract the information from the error:

```js
function handleError(err) {
  if (err.error === `${namespace}.gameError`) {
    viewManager.displayToast(err.kwargs.message);
  } else {
    viewManager.displayToast('An unexpected error occurred');
  }
}
```

> You cannot test this yet, but you will be able to after implementing the rest
> of the functionality.



## Frontend: call the game creation procedure when the user clicks on the Create Game button

The backend/frontend interaction you implemented so far has been automatic and
transparent, not visible to the user. It is time to start reacting to user
actions.

If you look at the documentation of the `ViewManager` class, you will see that
emit events and that you can [listen to these events with its `on`
method][view-manager-on]. The `createGame` event is emitted when the user clicks
on the Create Game button. Let's react to that.

**Add the following code to the `initPlayer` callback in the `COMMUNICATIONS`
section**:

```js
session.call(`${namespace}.initPlayer`, []).then(result => {
  // <PREVIOUS CODE HERE...>

  // Handle DOM events.
  viewManager.on('createGame', () => onCreateGameClicked(session));
}).catch(handleError);
```

> Note that `session`, the connected WAMP session, is passed to the
> `onCreateGameClicked` function as an argument so that it can use it to call
> procedures and/or subscribe to topics.

Instead of writing the event handling code directly in the `initPlayer`
callback, it is good practice to dispatch that to a separate function. You must
now implement this `onCreateGameClicked` function.

You can now call the `createGame` procedure you registered earlier. **Add the
following code to the `GAME MANAGEMENT` section**:

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function onCreateGameClicked(session) {
  if (!currentPlayer) {
    return viewManager.displayToast('No player information available');
  }

  session.call(`${namespace}.createGame`, [], { playerId: currentPlayer.id }).then(newGame => {
    startGame(session, newGame, currentPlayer);
  }).catch(handleError);
}
```

As you can see, you want to start the game as soon as it has been created with
this new `startGame` function. Before implementing it, you will need to store
the current game once it has started. Again, storing it in memory is sufficient
for the purposes of this exercise. **Add the following declaration to the
`SETUP` section**:

```js
// SETUP
// =====

// <PREVIOUS CODE HERE...>

let currentGame;
```

You can now implement the `startGame` function. The provided `ViewManager` has a
[`displayGame` method][view-manager-display-game] that will display the game in
the user interface. **Add the following code to the `GAME MANAGEMENT` section**:

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function startGame(session, game, player) {
  currentGame = game;
  viewManager.displayGame(game, player);
}
```

Refresh your browser. **You should now be able to start a game by clicking the
Create Game button**. **You should also see the backend log the creation of the
game** in the terminal where you are running it.

If you **open a second browser window, you should also be able to see the game
displayed in the list of joinable games**, since the first `initPlayer`
procedure you implemented already returned that list to the frontend.



## Backend: publish an event to notify players that a new game can be joined

You don't want your opponent to have to refresh his or her browser window every
time you create a game. You want it to be displayed in real time! This is where
WAMP's publish & subscribe functionality will be useful.

Let's publish an event on the `joinableGameAdded` topic every time a game is
created. **Add the following code to the `createGame` function in the `GAME
MANAGEMENT` section** (before the `return` statement):

```js
function createGame(session, playerId) {
  // <PREVIOUS CODE HERE...>

  // Notify subscribers that the game can now be joined.
  session.publish(`${namespace}.joinableGameAdded`, [], { game: newGame });

  return newGame;
}
```

Other WAMP clients can now subscribe to that topic to be notified of new
joinable games.



## Frontend: subscribe to the event to display new joinable games

**Add the following code to `connection.onopen` callback in the `COMMUNICATIONS`
section** to subscribe to the new `joinableGameAdded` topic on the frontend:

```js
connection.onopen = function(session) {
  // <PREVIOUS CODE HERE...>

  // Subscribe to joinable game events.
  session.subscribe(`${namespace}.joinableGameAdded`, (args, params) => onJoinableGameAdded(params.game));
};
```

The `ViewManager` class has an [`addJoinableGame`
method][view-manager-add-joinable-game] that can be used to display a new game
in the interface. **Add the following function to the `GAME MANAGEMENT`
section** to display the games notified in the `joinableGameAdded` topic:

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function onJoinableGameAdded(game) {
  viewManager.addJoinableGame(game);
}
```

Refresh both your browser windows. Create a game in window 1 and **you should
see it appear in real time in window 2**.



## Backend: register a procedure to join a game

Creating games is all well and good, but you want your opponents to be able to
join them! Let's register a new `joinGame` procedure in the backend to do that.

**Add the following code to the `connection.onopen` callback in the
`COMMUNICATIONS` section** to register the procedure:

```js
connection.onopen = function(session) {
  session.register(`${namespace}.joinGame`, (args, params) => joinGame(session, params.gameId, params.playerId)).catch(onRegistrationFailure);
};
```

You must now implement the `joinGame` function. The provided `GameController`
has a [`joinGame` method][game-controller-join-game] you can use to make the
player join the game.

**Add the following function to the `GAME MANAGEMENT` section**:

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

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

The `joinGame` procedure is now ready to be called by other WAMP clients.





## Frontend: call the `joinGame` procedure when the user clicks the Join Game button

For your opponent to join the game, he or she will click on the Join Game
button. The `ViewManager` will emit a `joinGame` event with the game ID when
that occurs.

**Add the following code to the `initPlayer` callback in the `COMMUNICATIONS`
section**:

```js
session.call(`${namespace}.initPlayer`, []).then(result => {
  // <PREVIOUS CODE HERE...>
  viewManager.on('joinGame', gameId => onJoinGameClicked(session, gameId, currentPlayer.id));
}).catch(handleError);
```

**Add the following code to the `GAME MANAGEMENT` section** to implement the new
`onJoinGameClicked` function:

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function onJoinGameClicked(session, gameId, playerId) {
  session.call(`${namespace}.joinGame`, [], { gameId, playerId }).then(result => {
    startGame(session, result.game, currentPlayer);
  }).catch(handleError);
}
```

Refresh both your browser windows and **you should now be able to create a game
in window 1 and join it in window 2**.



## Backend: publish the `joinableGameRemoved` event when a game starts

Just as you published an event earlier to notify players that a joinable game
was added, you must now notify other players that a game is no longer joinable
once it has started. Let's publish an event on a new `joinableGameRemoved` topic when that happens.

**Add the following code to the `joinGame` function in the `GAME MANAGEMENT`
section** (before the `return` statement):

```js
function joinGame(session, gameId, playerId) {
  // <PREVIOUS CODE HERE...>

  // Notify subscribers that the game is no longer joinable.
  session.publish(`${namespace}.joinableGameRemoved`, [], { gameId });

  return result;
}
```

Other WAMP clients can now subscribe to that topic to be notified of games that
are no longer joinable.



## Frontend: subscribe to the `joinableGameRemoved` event

**Add the following code to `connection.onopen` callback in the `COMMUNICATIONS`
section** to subscribe to the new `joinableGameRemoved` topic on the frontend:

```js
connection.onopen = function(session) {
  // <PREVIOUS CODE HERE...>
  session.subscribe(`${namespace}.joinableGameRemoved`, (args, params) => onJoinableGameRemoved(params.gameId));
};
```

The provided `ViewManager` class has a [`removeJoinable`
game][view-manager-remove-joinable-game] that does the opposite of the
`addJoinableGame` method: it removes a game from the list. **Add the following
function to the `GAME MANAGEMENT` section**:

```js
// GAME MANAGEMENT
// ===============

// <PREVIOUS CODE HERE...>

function onJoinableGameRemoved(gameId) {
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
  viewManager.on('play', (col, row) => onBoardCellClicked(session, col, row));
  ```
* During a game, the `leaveGame` event is emitted when the player clicks on the
  Leave Game button.

  You need to listen to this event and handle it with a new game management
  function:

  ```js
  viewManager.on('leaveGame', () => onLeaveGameClicked(session));
  ```

You will probably need to register new procedures for these actions and register
them in the backend. Look at the documentation of the [`GameController`
class][game-controller] and see what methods you need to call to handle the new
commands.

The backend will probably also need to publish events on new topics once the
actions have been performed.



[autobahn]: https://github.com/crossbario/autobahn-js
[autobahn-call]: https://github.com/crossbario/autobahn-js/blob/master/doc/reference.md#call
[autobahn-connections]: https://github.com/crossbario/autobahn-js/blob/master/doc/reference.md#connections
[autobahn-errors]: https://github.com/crossbario/autobahn-js/blob/master/doc/reference.md#errors
[autobahn-register]: https://github.com/crossbario/autobahn-js/blob/master/doc/reference.md#register
[crossbar-auth]: https://crossbar.io/docs/Authentication/
[crossbar-auth-ticket]: https://crossbar.io/docs/Ticket-Authentication/
[crossbar-docker]: https://crossbar.io/docs/Getting-Started/#starting-a-crossbar-io-router
[dotenv]: https://www.npmjs.com/package/dotenv
[game-controller]: https://mediacomem.github.io/comem-archioweb-tictactoe/GameController.html
[game-controller-create-new-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/GameController.html#createNewGame
[game-controller-join-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/GameController.html#joinGame
[game-error]: https://mediacomem.github.io/comem-archioweb-tictactoe/GameError.html
[player-controller-create-player]: https://mediacomem.github.io/comem-archioweb-tictactoe/PlayerController.html#createPlayer
[view-manager-add-joinable-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/ViewManager.html#addJoinableGame
[view-manager-display-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/ViewManager.html#displayGame
[view-manager-on]: https://mediacomem.github.io/comem-archioweb-tictactoe/ViewManager.html#on
[view-manager-remove-joinable-game]: https://mediacomem.github.io/comem-archioweb-tictactoe/ViewManager.html#removeJoinableGame
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[reverse-dns]: https://en.wikipedia.org/wiki/Reverse_domain_name_notation
[wamp]: https://wamp-proto.org
[webpack-define-plugin]: https://webpack.js.org/plugins/define-plugin/