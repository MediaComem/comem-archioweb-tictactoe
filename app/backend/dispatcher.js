/* eslint-disable */
/**
 * This file handles backend communication with frontend clients.
 * @exports app/backend/dispatcher
 */
const GameManager = require('../class/game-manager.class');
const { createLogger } = require('./config');
const GameController = require('./controller/game.controller');
const PlayerController = require('./controller/player.controller');

/**
 * Creates the backend's dispatcher.
 * @param {HttpServer} server - The application's {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server|Node.js HTTP server}.
 */
exports.createBackendDispatcher = function(server) {

  // SETUP
  // =====

  const gameManager = new GameManager();
  const gameController = new GameController(gameManager);
  const logger = createLogger('dispatcher');
  const playerController = new PlayerController(gameManager);

  // TODO: declare variables and generic functions if you need them

  /**
   * Example: declare state
   *
   *     const clients = {};
   */

  /**
   * Example: log a message
   *
   *     logger.debug('Detailed debug message');
   *     logger.info('Informational message');
   *     logger.warn('Warning message');
   *     logger.error('Error message');
   */

  // GAME MANAGEMENT
  // ===============

  // TODO: write game management functions if you need them

  /**
   * Example: create a new game
   *
   *     try {
   *       const newGame = gameController.createNewGame(playerId);
   *       // The game has been created.
   *     } catch (err) {
   *       switch (err.code) {
   *         case 'tictactoe.playerNotFound':
   *           // The player does not exist.
   *           break;
   *         default:
   *           // An unexpected error occurred.
   *       }
   *     }
   */

  /**
   * Example: do something for all players
   *
   *     gameManager.players.forEach(player => {
   *       // Do something with player...
   *     });
   */

  /**
   * Example: do something for a specific game's players
   *
   *     game.players.forEach(player => {
   *       // Do something with player...
   *     });
   */

  /**
   * Example: make a player play a move in a game
   *
   *     try {
   *       const result = gameController.play(gameId, playerId, col, row)
   *       if (result.win) {
   *         // The game has been won.
   *       } else if (result.draw) {
   *         // The game is a draw.
   *       } else {
   *         // The game continues.
   *       }
   *     } catch (err) {
   *       switch (err.code) {
   *         case 'tictactoe.gameNotFound':
   *           // The game does not exist.
   *           break;
   *         case 'tictactoe.invalidMove':
   *           // The player cannot make that move.
   *           break;
   *         default:
   *           // An unexpected error occurred.
   *       }
   *     }
   */

  /**
   * Example: make a player join a game
   *
   *     try {
   *       const result = gameController.joinGame(gameId, playerId);
   *       // The player has successfully joined the game.
   *     } catch (err) {
   *       switch (err.code) {
   *         case 'tictactoe.gameNotFound':
   *           // The game does not exist.
   *           break;
   *         case 'tictactoe.playerNotFound':
   *           // The player does not exist.
   *           break;
   *         case 'tictactoe.gameFull':
   *           // The game is full.
   *           break;
   *         default:
   *           // An unexpected error occurred.
   *       }
   *     }
   */

  /**
   * Example: make a player leave a game
   *
   *     try {
   *       const result = gameController.leaveGame(gameId, playerId);
   *       // The player has left the game.
   *     } catch(err) {
   *       switch (err.code) {
   *         case 'tictactoe.gameNotFound':
   *           // The game does not exist.
   *           break;
   *         case 'tictactoe.playerNotInGame':
   *           // The player is not in that game.
   *           break;
   *         default:
   *           // An unexpected error occurred.
   *       }
   *     }
   */

  // PLAYER MANAGEMENT
  // =================

  // TODO: write game management functions if you need them

  // COMMUNICATIONS
  // ==============

  // TODO: implement the backend's communications with WebSockets or the Web Application Messaging Protocol (WAMP).
};

/**
 * A {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server|Node.js HTTP server}.
 * @typedef HttpServer
 * @see {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server}
 */
