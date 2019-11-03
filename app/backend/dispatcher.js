/**
 * This file handles backend communication with frontend clients.
 * @exports app/backend/dispatcher
 */
const autobahn = require('autobahn');

const GameError = require('../class/game-error.class');
const GameManager = require('../class/game-manager.class');
const { createLogger, namespace, secret } = require('./config');
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
      // Send game error details to the Caller if this is a game-related error.
      throw new autobahn.Error(`${namespace}.gameError`, [], { code: err.code, message: err.message });
    } else {
      throw err;
    }
  }

  function onRegistrationFailure(err) {
    logger.fatal(err);
    process.exit(1);
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

    // Notify subscribers that the game can now be joined.
    session.publish(`${namespace}.joinableGameAdded`, [], { game: newGame });

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

    // Notify subscribers that the game is no longer joinable.
    session.publish(`${namespace}.joinableGameRemoved`, [], { gameId });

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

    // Check the status of the game.
    let status;
    if (result.win) {
      status = 'win';
    } else if (result.draw) {
      status = 'draw';
    }

    if (status) {
      logger.info(`Game ${gameId} is a ${status}`);
    }

    // Notify subscribers to the game's "played" topic of the move.
    session.publish(`${namespace}.games.${gameId}.played`, [], { col, row, status, icon: result.icon });
  }

  function leaveGame(session, gameId, playerId) {

    try {
      gameController.leaveGame(gameId, playerId);
      logger.info(`Player ${playerId} left game ${gameId}`);
    } catch (err) {
      return handleError(err);
    }

    // Notify subscribers to the game's "left" topic that the player left.
    session.publish(`${namespace}.games.${gameId}.left`, [], { playerId });

    // Notify subscribers that the game is no longer joinable.
    session.publish(`${namespace}.joinableGameRemoved`, [], { gameId });
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
    realm: 'tictactoe',
    authid: 'tictactoe',
    authmethods: [ 'ticket' ],
    onchallenge: function() {
      return secret;
    }
  });

  connection.onopen = function(session) {
    logger.info('Connection to WAMP router established');
    session.register(`${namespace}.initPlayer`, () => initPlayer()).catch(onRegistrationFailure);
    session.register(`${namespace}.createGame`, (args, params) => createGame(session, params.playerId)).catch(onRegistrationFailure);
    session.register(`${namespace}.joinGame`, (args, params) => joinGame(session, params.gameId, params.playerId)).catch(onRegistrationFailure);
    session.register(`${namespace}.play`, (args, params) => play(session, params.gameId, params.playerId, params.col, params.row)).catch(onRegistrationFailure);
    session.register(`${namespace}.leaveGame`, (args, params) => leaveGame(session, params.gameId, params.playerId)).catch(onRegistrationFailure);
  };

  connection.open();
};

/**
 * A {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server|Node.js HTTP server}.
 * @typedef HttpServer
 * @see {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server}
 */
