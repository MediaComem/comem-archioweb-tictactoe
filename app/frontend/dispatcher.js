/**
 * This file handles the frontend client's communications with the backend.
 * @module app/frontend/dispatcher
 */
import autobahn from 'autobahn';

/**
 * Creates the frontend's dispatcher.
 * @param {ViewManager} viewManager - The frontend's view manager.
 */
export function createFrontendDispatcher(viewManager) {

  const namespace = TICTACTOE_NAMESPACE;
  const secret = TICTACTOE_SECRET;

  let currentGame;
  let currentPlayer;
  const currentGameSubscriptions = [];

  function handleError(err) {
    if (err.error === `${namespace}.gameError`) {
      viewManager.displayToast(err.kwargs.message);
    } else {
      viewManager.displayToast('An unexpected error occurred');
    }
  }

  // GAME MANAGEMENT
  // ===============

  function onCreateGameClicked(session) {
    if (!currentPlayer) {
      return viewManager.displayToast('No player information available');
    }

    session.call(`${namespace}.createGame`, [], { playerId: currentPlayer.id }).then(newGame => {
      startGame(session, newGame, currentPlayer);
    }).catch(handleError);
  }

  function onJoinGameClicked(session, gameId, playerId) {
    session.call(`${namespace}.joinGame`, [], { gameId, playerId }).then(result => {
      startGame(session, result.game, currentPlayer);
    }).catch(handleError);
  }

  function onBoardCellClicked(session, gameId, playerId, col, row) {
    session.call(`${namespace}.play`, [], { gameId, playerId, col, row }).catch(handleError);
  }

  function onLeaveGameClicked(session) {
    if (!currentGame || !currentPlayer) {
      return;
    }

    session.call(`${namespace}.leaveGame`, [], { gameId: currentGame.id, playerId: currentPlayer.id }).catch(handleError);
  }

  function onJoinableGameAdded(game) {
    viewManager.addJoinableGame(game);
  }

  function onGameMovePlayed(col, row, icon, status) {
    viewManager.updateBoard(col, row, icon);

    if (status === 'win') {
      viewManager.displayToast(`${icon} wins!`);
    } else if (status === 'draw') {
      viewManager.displayToast('Draw!');
    }
  }

  function onGameLeft(session, playerId) {

    viewManager.displayToast(playerId === currentPlayer.id ? 'You have left the game' : 'Your opponent has left the game');
    viewManager.leaveGame();

    // Unsubscribe from the game's topics.
    currentGameSubscriptions.forEach(sub => session.unsubscribe(sub));
    currentGameSubscriptions.length = 0;
  }

  function startGame(session, game, player) {
    currentGame = game;

    // Subscribe to played moves.
    session.subscribe(
      `${namespace}.games.${game.id}.played`,
      (args, params) => onGameMovePlayed(params.col, params.row, params.icon, params.status)
    ).then(sub => currentGameSubscriptions.push(sub));

    // Subscribe to players leaving the game.
    session.subscribe(
      `${namespace}.games.${game.id}.left`,
      (args, params) => onGameLeft(session, params.playerId)
    ).then(sub => currentGameSubscriptions.push(sub));

    viewManager.displayGame(game, player);
  }

  function onJoinableGameRemoved(gameId) {
    viewManager.removeJoinableGame(gameId);
  }

  // COMMUNICATIONS
  // ==============

  const connection = new autobahn.Connection({
    url: 'wss://wamp.archidep.media/ws',
    realm: 'tictactoe',
    authid: 'tictactoe',
    authmethods: [ 'ticket' ],
    onchallenge: function() {
      return secret;
    }
  });

  connection.onopen = function(session) {
    console.log('Connection to WAMP router established');

    // Initialize a player once connected to the router.
    session.call(`${namespace}.initPlayer`, [], {}).then(result => {

      currentPlayer = result.player;
      console.log(`Player ID is ${result.player.id}`);

      for (const game of result.games) {
        onJoinableGameAdded(game);
      }

      // Handle DOM events.
      viewManager.on('createGame', () => onCreateGameClicked(session));
      viewManager.on('joinGame', gameId => onJoinGameClicked(session, gameId, currentPlayer.id));
      viewManager.on('play', (col, row) => onBoardCellClicked(session, currentGame.id, currentPlayer.id, col, row));
      viewManager.on('leaveGame', () => onLeaveGameClicked(session));
    }).catch(handleError);

    // Subscribe to joinable game events.
    session.subscribe(`${namespace}.joinableGameAdded`, (args, params) => onJoinableGameAdded(params.game));
    session.subscribe(`${namespace}.joinableGameRemoved`, (args, params) => onJoinableGameRemoved(params.gameId));
  };

  connection.open();
}
