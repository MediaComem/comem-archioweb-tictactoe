/* eslint-disable no-unused-vars */
const autobahn = require('autobahn');

const GameManager = require('../class/game-manager.class');
const { createLogger } = require('./config');
const GameController = require('./controller/game.controller');
const PlayerController = require('./controller/player.controller');

const gameManager = new GameManager();
const gameController = new GameController(gameManager);
const logger = createLogger('dispatcher');
const playerController = new PlayerController(gameManager);

// GAME MANAGEMENT
// ===============

function createGame(session, playerId) {
  const newGame = gameController.createNewGame(playerId);
  session.publish('ch.comem.archioweb.tictactoe.games.added', [], { game: newGame });
  return newGame;
}

function joinGame(session, gameId, playerId) {

  const result = gameController.joinGame(gameId, playerId);
  if (result === 'invalidGame') {
    throw [ 'No such game' ];
  }

  session.publish('ch.comem.archioweb.tictactoe.games.removed', [], { gameId });

  return result;
}

function play(session, gameId, playerId, col, row) {

  const result = gameController.play(gameId, playerId, col, row);
  if (result === 'invalidGame') {
    throw [ 'No such game' ];
  } else if (result === 'invalidMove') {
    throw [ 'Invalid move' ];
  }

  let status;
  if (result.hasWin) {
    status = 'win';
  } else if (result.draw) {
    status = 'draw';
  }

  session.publish(`ch.comem.archioweb.tictactoe.games.${gameId}.played`, [], { col, row, status, icon: result.playerIcon });
}

function exitGame(session, gameId, playerId) {

  gameController.exitGame(gameId, playerId);

  session.publish(`ch.comem.archioweb.tictactoe.games.${gameId}.left`, [], { playerId });
  session.publish('ch.comem.archioweb.tictactoe.games.removed', [], { gameId });
}

// PLAYER MANAGEMENT
// =================

function initPlayer() {
  return {
    games: gameController.getJoinableGames(),
    player: playerController.createPlayer()
  };
}

// COMMUNICATIONS
// ==============

exports.createDispatcher = function(server) {

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
    logger.info('Connection to WAMP router established');
    session.register('ch.comem.archioweb.tictactoe.initPlayer', initPlayer);
    session.register('ch.comem.archioweb.tictactoe.createGame', (args, params) => createGame(session, params.playerId));
    session.register('ch.comem.archioweb.tictactoe.joinGame', (args, params) => joinGame(session, params.gameId, params.playerId));
    session.register('ch.comem.archioweb.tictactoe.exitGame', (args, params) => exitGame(session, params.gameId, params.playerId));
    session.register('ch.comem.archioweb.tictactoe.play', (args, params) => play(session, params.gameId, params.playerId, params.col, params.row));
  };

  connection.open();
};
