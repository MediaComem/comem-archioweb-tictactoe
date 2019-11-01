/* eslint-disable no-unused-vars */
const GameManager = require('../class/game-manager.class');
const GameController = require('./controller/game.controller');
const PlayerController = require('./controller/player.controller');

const gameManager = new GameManager();
const playerController = new PlayerController(gameManager);
const gameController = new GameController(gameManager);

// GAME MANAGEMENT
// ===============

/**
 * Example: create a new game
 *
 *     const newGame = gameController.createNewGame(playerId);
 */

/**
 * Example: do something for each player
 *
 *     gameManager.players.forEach(player => {
 *       // Do something with player...
 *     });
 */

/**
 * Example: update the board
 *
 *     const result = gameController.updateBoardRequest(gameId, playerId, col, row)
 *
 *     if (result === 'noGameFound') {
 *       // The game does not exist.
 *     } else if (result === 'invalidMove') {
 *       // That player cannot make that move.
 *     } else if (result.hasWin) {
 *       // The game has been won.
 *       const playerIcon = result.playerIcon; // X or O (the player who won)
 *     } else if (result.draw) {
 *        // The game is a draw.
 *      } else {
 *        // The game continues.
 *      }
 */

/**
 * Example: make a player join a game
 *
 *     const result = gameController.requestJoinGame(gameId, playerId);
 *
 *     if (result === 'invalidGame') {
 *       // The game does not not exist or no longer accepts new players.
 *     } else {
 *       // The player has successfully joined the game.
 *     }
 */

/**
 * Example: make a player exit a game
 *
 *     const result = gameController.exitGame(gameId, playerId);
 *
 *     // Do something for the game's players.
 *     result.game.players.forEach(player => {
 *       // Do something with player...
 *     });
 */

// COMMUNICATIONS
// ==============

// TODO: implement the backend's communications with WebSockets or the Web Application Messaging Protocol (WAMP).
