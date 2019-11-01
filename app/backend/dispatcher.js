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

    session.register('ch.comem.archioweb.tictactoe.getPlayer', function() {
      return playerController.createPlayer();
    });

    session.register('ch.comem.archioweb.tictactoe.getJoinableGames', function() {
      return gameController.getJoinableGames();
    });

    session.register('ch.comem.archioweb.tictactoe.createNewGame', function(args) {
      const player = args[0];
      const newGame = gameController.createNewGame(player.id);
      session.publish('ch.comem.archioweb.tictactoe.newGames', [ newGame ]);
      return newGame;
    });

    session.register('ch.comem.archioweb.tictactoe.requestJoinGame', function(args) {

      const gameId = args[0];
      const playerId = args[1];
      const result = gameController.joinGame(gameId, playerId);
      if (result === 'invalidGame') {
        throw new Error('Invalid game');
      }

      session.publish('ch.comem.archioweb.tictactoe.removedGames', [ result.game.id ]);

      return result.game;
    });

    session.register('ch.comem.archioweb.tictactoe.exitGame', function(args) {

      const gameId = args[0];
      const playerId = args[1];
      gameController.exitGame(gameId, playerId);

      session.publish(`ch.comem.archioweb.tictactoe.games.${gameId}.exited`, [ playerId ]);
      session.publish('ch.comem.archioweb.tictactoe.removedGames', [ gameId ]);
    });

    session.register('ch.comem.archioweb.tictactoe.updateBoard', function(args) {

      const gameId = args[0];
      const playerId = args[1];
      const row = args[2];
      const col = args[3];
      const result = gameController.play(gameId, playerId, col, row);
      if (result === 'invalidGame') {
        throw [ 'No such game' ];
      } else if (result === 'invalidMove') {
        throw [ 'Invalid move' ];
      }

      session.publish(`ch.comem.archioweb.tictactoe.games.${gameId}.moves`, [ row, col, result.playerIcon, result.hasWin, result.draw ]);
    });
  };

  connection.open();
};
