/* eslint-disable no-unused-vars */
const LCS_MANAGER = require('./localstorage-manager');
const ViewManager = require('./view-manager');

const viewManager = new ViewManager();

// GAME MANAGEMENT
// ===============

/**
 * Example: store the game information
 *
 *     LCS_MANAGER.save('game', game);
 */

/**
 * Example: load the game information
 *
 *     const game = LCS_MANAGER.load('game');
 *     if (game) {
 *       // The stored game information is available.
 *     } else {
 *       // No game information is available.
 *     }
 */

/**
 * Example: handle creating & exiting games
 *
 *     viewManager.initEventManager(
 *       function createGame() {
 *         // The player has clicked the Create Game button.
 *       },
 *       function exitGame() {
 *         // The player has clicked the Exit Game button.
 *       }
 *     );
 */

/**
 * Example: start a game
 *
 *     viewManager.displayNewGame(player, game, function play(col, row) {
 *       // The player has clicked in the col,row cell.
 *     });
 */

/**
 * Example: update the board
 *
 *     viewManager.updateBoard(col, row, icon);
 */

/**
 * Example: add a new joinable game
 *
 *     viewManager.addNewJoinableGame(player, game, function requestJoinGame(gameId, playerId) {
 *       // The player has requested to join this game.
 *     });
 */

/**
 * Example: remove a joinable game
 *
 *     viewManager.removeJoinableGame(gameId);
 */

/**
 * Example: exit the current game
 *
 *     viewManager.exitGame();
 */

/**
 * Example: display a toast message
 *
 *     viewManager.displayToast('Hello World');
 */

// PLAYER MANAGEMENT
// =================

/**
 * Example: store the player information
 *
 *     LCS_MANAGER.save('player', player);
 */

/**
 * Example: load the player information
 *
 *     const player = LCS_MANAGER.load('player');
 *     if (player) {
 *       // The stored player information is available.
 *     } else {
 *       // No player information is available.
 *     }
 */

// COMMUNICATIONS
// ==============

// TODO: implement the frontend's communications with WebSockets or the Web Application Messaging Protocol (WAMP).
