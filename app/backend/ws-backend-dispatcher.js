const autobahn = require('autobahn');
const WebSocket = require('ws')

const GameController = require('../backend/controller/game.controller')
const PlayerController = require('../backend/controller/player.controller')
const GameManager = require('../class/game-manager.class')

const gameManager = new GameManager()
const playerController = new PlayerController(gameManager)
const gameController = new GameController(gameManager)


// ---- GAME MANAGEMENT

// --- init websocket
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connection = new autobahn.Connection({
  url: 'wss://wamp.archidep.media/ws',
  realm: 'realm1'
  /*authid: 'jdoe',
  authmethods: [ 'ticket' ],
  onchallenge: function() {
    console.log('@@@ on challenge', JSON.stringify(Array.prototype.slice(arguments)));
    return 'letmein';
  }*/
});

connection.onopen = function(session) {
  console.log('Connection to WAMP router established');

  session.register('ch.comem.archioweb.tictactoe.getPlayer', function() {
    return playerController.createPlayer();
  });

  session.register('ch.comem.archioweb.tictactoe.getJoinableGames', function() {
    return gameController.getJoinableGames();
  });

  session.register('ch.comem.archioweb.tictactoe.createNewGame', function(args) {
    const player = args[0];
    const newGame = gameController.createNewGame(player);
    session.publish('ch.comem.archioweb.tictactoe.newGames', [ newGame ]);
    return newGame;
  });

  session.register('ch.comem.archioweb.tictactoe.requestJoinGame', function(args) {

    const gameId = args[0];
    const playerId = args[1];
    const result = gameController.requestJoinGame(gameId, playerId);
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
    const result = gameController.updateBoardRequest(gameId, playerId, row, col);
    if (result === 'noGameFound') {
      return;
    } else if (result === 'invalidMove') {
      throw [ 'Invalid move' ];
    }

    session.publish(`ch.comem.archioweb.tictactoe.games.${gameId}.moves`, [ row, col, result.playerIcon, result.hasWin, result.draw ]);
  });
};

connection.open();

// --- websocket route
/*
    Message data structure :
    {
        'resource':'[RESOURCE_NAME]'.
        'command':'[COMMAND_NAME]',
        'params': [
            {'param1':'zzz'},
            ...
        ]
    }
*/