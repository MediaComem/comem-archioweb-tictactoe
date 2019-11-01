/* eslint-disable no-unused-vars */
const autobahn = require('autobahn');

const ViewManager = require('./view-manager');

let currentGame;
let currentPlayer;

const viewManager = new ViewManager();

function onError(err) {
  if (err.args && err.args.length) {
    viewManager.displayToast(err.args[0]);
  } else {
    viewManager.displayToast('An unexpected error occurred');
  }
}

// GAME MANAGEMENT
// ===============

function onGameAdded(session, game) {
  viewManager.addGame(currentPlayer, game, function onJoinGame(gameId, playerId) {
    session.call('ch.comem.archioweb.tictactoe.joinGame', [], { gameId, playerId }).then(result => {
      startGame(session, result.game, currentPlayer);
    }).catch(onError);
  });
}

function onGameMove(col, row, icon, status) {
  viewManager.updateBoard(col, row, icon);

  if (status === 'win') {
    viewManager.displayToast(`${icon} wins!`);
  } else if (status === 'draw') {
    viewManager.displayToast('Draw!');
  }
}

function onGameLeft(session, subscriptions, playerId) {

  viewManager.displayToast(playerId === currentPlayer.id ? 'You have left the game' : 'Your opponent has left the game');
  viewManager.exitGame();

  subscriptions.forEach(sub => session.unsubscribe(sub));
}

function createGame(session) {
  if (!currentPlayer) {
    return viewManager.displayToast('No player information available');
  }

  session.call('ch.comem.archioweb.tictactoe.createGame', [], { playerId: currentPlayer.id }).then(newGame => {
    startGame(session, newGame, currentPlayer);
  }).catch(onError);
}

function startGame(session, game, player) {
  currentGame = game;
  const subscriptions = [];

  session.subscribe(
    `ch.comem.archioweb.tictactoe.games.${game.id}.played`,
    (args, params) => onGameMove(params.col, params.row, params.icon, params.status)
  ).then(sub => subscriptions.push(sub));

  session.subscribe(
    `ch.comem.archioweb.tictactoe.games.${game.id}.left`,
    (args, params) => onGameLeft(session, subscriptions, params.playerId)
  ).then(sub => subscriptions.push(sub));

  viewManager.displayGame(player, game, (col, row) => {
    session.call('ch.comem.archioweb.tictactoe.play', [], { gameId: game.id, playerId: player.id, col, row }).catch(onError);
  });
}

function exitGame(session) {
  if (!currentGame || !currentPlayer) {
    return;
  }

  session.call('ch.comem.archioweb.tictactoe.exitGame', [], { gameId: currentGame.id, playerId: currentPlayer.id }).catch(onError);
}

function onGameRemoved(gameId) {
  viewManager.removeGame(gameId);
}

// PLAYER MANAGEMENT
// =================

function onInitPlayer(session, player, games) {
  currentPlayer = player;
  console.log(`Player ID is ${player.id}`);

  viewManager.initEventManager(
    () => createGame(session),
    () => exitGame(session)
  );

  for (const game of games) {
    onGameAdded(session, game);
  }
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
    onInitPlayer(session, result.player, result.games);
  }).catch(onError);

  session.subscribe('ch.comem.archioweb.tictactoe.games.added', (args, params) => onGameAdded(session, params.game));
  session.subscribe('ch.comem.archioweb.tictactoe.games.removed', (args, params) => onGameRemoved(params.gameId));
};

connection.open();
