/**
 * This file handles backend communication with frontend clients.
 * @exports app/backend/dispatcher
 */
const autobahn = require('autobahn');

const GameError = require('../class/game-error.class');
const GameManager = require('../class/game-manager.class');
const { createLogger } = require('./config');
const GameController = require('./controller/game.controller');
const PlayerController = require('./controller/player.controller');

/**
 * Creates the backend's dispatcher.
 * @param {HttpServer} server - The application's {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server|Node.js HTTP server}.
 */
exports.createBackendDispatcher = function() {

  // SETUP
  // =====

  const gameManager = new GameManager();
  const gameController = new GameController(gameManager);
  const logger = createLogger('dispatcher');
  const playerController = new PlayerController(gameManager);

  function handleError(err) {
    if (err instanceof GameError) {
      throw new autobahn.Error('ch.comem.archioweb.tictactoe.gameError', [], { code: err.code, message: err.message });
    } else {
      throw err;
    }
  }

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

    session.publish('ch.comem.archioweb.tictactoe.joinableGames.added', [], { game: newGame });

    return newGame;
  }

  function joinGame(session, gameId, playerId) {
    let result;

    try {
      result = gameController.joinGame(gameId, playerId);
      logger.info(`Player ${playerId} joined game ${gameId}`);
    } catch (err) {
      return handleError(err);
    }

    session.publish('ch.comem.archioweb.tictactoe.joinableGames.removed', [], { gameId });

    return result;
  }

  function play(session, gameId, playerId, col, row) {
    let result;

    try {
      result = gameController.play(gameId, playerId, col, row);
      logger.info(`Player ${playerId} played ${col},${row} in game ${gameId}`);
    } catch (err) {
      return handleError(err);
    }

    let status;
    if (result.win) {
      status = 'win';
    } else if (result.draw) {
      status = 'draw';
    }

    if (status) {
      logger.info(`Game ${gameId} is a ${status}`);
    }

    session.publish(`ch.comem.archioweb.tictactoe.games.${gameId}.played`, [], { col, row, status, icon: result.icon });
  }

  function leaveGame(session, gameId, playerId) {

    try {
      gameController.leaveGame(gameId, playerId);
      logger.info(`Player ${playerId} left game ${gameId}`);
    } catch (err) {
      return handleError(err);
    }

    session.publish(`ch.comem.archioweb.tictactoe.games.${gameId}.left`, [], { playerId });
    session.publish('ch.comem.archioweb.tictactoe.joinableGames.removed', [], { gameId });
  }

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
    logger.info('Connection to WAMP router established');
    session.register('ch.comem.archioweb.tictactoe.initPlayer', () => initPlayer());
    session.register('ch.comem.archioweb.tictactoe.createGame', (args, params) => createGame(session, params.playerId));
    session.register('ch.comem.archioweb.tictactoe.joinGame', (args, params) => joinGame(session, params.gameId, params.playerId));
    session.register('ch.comem.archioweb.tictactoe.play', (args, params) => play(session, params.gameId, params.playerId, params.col, params.row));
    session.register('ch.comem.archioweb.tictactoe.leaveGame', (args, params) => leaveGame(session, params.gameId, params.playerId));
  };

  connection.open();
};

/**
 * A {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server|Node.js HTTP server}.
 * @typedef HttpServer
 * @see {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server}
 */
