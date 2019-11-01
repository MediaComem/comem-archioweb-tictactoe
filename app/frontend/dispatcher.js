/* eslint-disable no-unused-vars */
const autobahn = require('autobahn');

const ViewManager = require('./view-manager');

let currentGame;
let currentPlayer;

const viewManager = new ViewManager();

// GAME MANAGEMENT
// ===============

function addNewJoinableGame(session, game) {
  viewManager.addNewJoinableGame(currentPlayer, game, (gameId, playerId) => {
    session.call('ch.comem.archioweb.tictactoe.requestJoinGame', [ gameId, playerId ]).then(joinedGame => {
      displayNewGame(session, joinedGame, currentPlayer);
    });
  });
}

function createNewGame(session) {
  if (!currentPlayer) {
    return viewManager.displayToast('No player information available');
  }

  session.call('ch.comem.archioweb.tictactoe.createNewGame', [ currentPlayer ]).then(newGame => {
    displayNewGame(session, newGame, currentPlayer);
  });
}

function displayNewGame(session, game, player) {

  let moveSubscription;
  session.subscribe(`ch.comem.archioweb.tictactoe.games.${game.id}.moves`, function(args) {

    const row = args[0];
    const col = args[1];
    const icon = args[2];
    const win = args[3];
    const draw = args[4];
    updateBoard(col, row, icon);

    if (win) {
      viewManager.displayToast(`${icon} wins!`);
    } else if (draw) {
      viewManager.displayToast('Draw!');
    }
  }).then(sub => {
    moveSubscription = sub;
  });

  let exitedSubscription;
  session.subscribe(`ch.comem.archioweb.tictactoe.games.${game.id}.exited`, function(args) {

    const playerId = args[0];
    viewManager.displayToast(playerId === currentPlayer.id ? 'You have left the game' : 'Your opponent has left the game');
    viewManager.exitGame();

    if (exitedSubscription) {
      session.unsubscribe(exitedSubscription);
    }

    if (moveSubscription) {
      session.unsubscribe(moveSubscription);
    }
  }).then(sub => {
    exitedSubscription = sub;
  });

  viewManager.displayGame(player, game, (col, row) => {
    session.call('ch.comem.archioweb.tictactoe.updateBoard', [ game.id, player.id, col, row ]).catch(err => {
      if (err.args && err.args.length) {
        viewManager.displayToast(err.args[0]);
      } else {
        console.warn(err);
      }
    });
  });
}

function exitGame(session) {
  if (!currentGame || !currentPlayer) {
    return;
  }

  session.call('ch.comem.archioweb.tictactoe.exitGame', [ currentGame.id, currentPlayer.id ]);
}

function removeJoinableGame(gameId) {
  viewManager.removeGame(gameId);
}

function updateBoard(col, row, icon) {
  viewManager.updateBoard(row, col, icon);
}

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

  session.call('ch.comem.archioweb.tictactoe.getPlayer', []).then(function(player) {
    currentPlayer = player;

    viewManager.initEventManager(
      () => createNewGame(session),
      () => exitGame(session)
    );

    session.call('ch.comem.archioweb.tictactoe.getJoinableGames', []).then(function(games) {
      for (const game of games) {
        addNewJoinableGame(session, game);
      }
    });
  });

  session.subscribe('ch.comem.archioweb.tictactoe.newGames', function(args) {
    const game = args[0];
    addNewJoinableGame(session, game);
  });

  session.subscribe('ch.comem.archioweb.tictactoe.removedGames', function(args) {
    const gameId = args[0];
    removeJoinableGame(gameId);
  });
};

connection.open();
