/**
 * This file handles the frontend client's communications with the backend.
 * @module app/frontend/dispatcher
 */
const autobahn = require('autobahn');

/**
 * Creates the frontend's dispatcher.
 * @param {ViewManager} viewManager - The frontend's view manager.
 */
export function createFrontendDispatcher(viewManager) {

  let currentGame;
  let currentPlayer;

  function handleError(err) {
    if (err.error === 'ch.comem.archioweb.tictactoe.gameError') {
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

    session.call('ch.comem.archioweb.tictactoe.createGame', [], { playerId: currentPlayer.id }).then(newGame => {
      startGame(session, newGame, currentPlayer);
    }).catch(handleError);
  }

  function onJoinGameClicked(session, gameId, playerId) {
    session.call('ch.comem.archioweb.tictactoe.joinGame', [], { gameId, playerId }).then(result => {
      startGame(session, result.game, currentPlayer);
    }).catch(handleError);
  }

  function onBoardCellClicked(session, gameId, playerId, col, row) {
    session.call('ch.comem.archioweb.tictactoe.play', [], { gameId, playerId, col, row }).catch(handleError);
  }

  function onLeaveGameClicked(session) {
    if (!currentGame || !currentPlayer) {
      return;
    }

    session.call('ch.comem.archioweb.tictactoe.leaveGame', [], { gameId: currentGame.id, playerId: currentPlayer.id }).catch(handleError);
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

  function onGameLeft(session, subscriptions, playerId) {

    viewManager.displayToast(playerId === currentPlayer.id ? 'You have left the game' : 'Your opponent has left the game');
    viewManager.leaveGame();

    subscriptions.forEach(sub => session.unsubscribe(sub));
  }

  function startGame(session, game, player) {
    currentGame = game;
    const subscriptions = [];

    session.subscribe(
      `ch.comem.archioweb.tictactoe.games.${game.id}.played`,
      (args, params) => onGameMovePlayed(params.col, params.row, params.icon, params.status)
    ).then(sub => subscriptions.push(sub));

    session.subscribe(
      `ch.comem.archioweb.tictactoe.games.${game.id}.left`,
      (args, params) => onGameLeft(session, subscriptions, params.playerId)
    ).then(sub => subscriptions.push(sub));

    viewManager.displayGame(game, player);
  }

  function onJoinableGameRemoved(gameId) {
    viewManager.removeJoinableGame(gameId);
  }

  // COMMUNICATIONS
  // ==============

  const connection = new autobahn.Connection({
    url: 'wss://wamp.archidep.media/ws',
    realm: 'realm1'
    // Authentication:
    // authid: 'jdoe',
    // authmethods: [ 'ticket' ],
    // onchallenge: function() {
    // console.log('@@@ on challenge', JSON.stringify(Array.prototype.slice(arguments)));
    // return 'letmein';
    // }
  });

  connection.onopen = function(session) {
    console.log('Connection to WAMP router established');

    session.call('ch.comem.archioweb.tictactoe.initPlayer', []).then(result => {

      currentPlayer = result.player;
      console.log(`Player ID is ${result.player.id}`);

      viewManager.on('createGame', () => onCreateGameClicked(session));
      viewManager.on('joinGame', gameId => onJoinGameClicked(session, gameId, currentPlayer.id));
      viewManager.on('play', (col, row) => onBoardCellClicked(session, currentGame.id, currentPlayer.id, col, row));
      viewManager.on('leaveGame', () => onLeaveGameClicked(session));

      for (const game of result.games) {
        onJoinableGameAdded(game);
      }
    }).catch(handleError);

    session.subscribe('ch.comem.archioweb.tictactoe.joinableGames.added', (args, params) => onJoinableGameAdded(params.game));
    session.subscribe('ch.comem.archioweb.tictactoe.joinableGames.removed', (args, params) => onJoinableGameRemoved(params.gameId));
  };

  connection.open();
}
