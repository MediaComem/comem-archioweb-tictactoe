const autobahn = require('autobahn');

const LCS_MANAGER = require('./localstorage-manager')
const ViewManager = require('./view-manager')

// ----------------------------------- CONSTANT DEFINITION

// ----------------------------------- WEBSOCKET INIT


const viewManager = new ViewManager()

// ----------------------------------- GAME MANAGEMENT    
function addNewJoinableGame(session, game) {
  const player = LCS_MANAGER.load('player');
  viewManager.addNewJoinableGame(player, game, (gameId, playerId) => {
    session.call('ch.comem.archioweb.tictactoe.requestJoinGame', [ gameId, playerId ]).then(joinedGame => {
      displayNewGame(session, joinedGame, player);
    });
  });
}

function createNewGame(session) {

  const player = LCS_MANAGER.load('player');
  if (!player) {
    return viewManager.displayToast('No player defined');
  }

  session.call('ch.comem.archioweb.tictactoe.createNewGame', [ player ]).then(newGame => {
    displayNewGame(session, newGame, player);
  });
}

function displayNewGame(session, game, player) {
  LCS_MANAGER.save('game', game);

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
  }).then(sub => moveSubscription = sub);

  let exitedSubscription;
  session.subscribe(`ch.comem.archioweb.tictactoe.games.${game.id}.exited`, function(args) {

    const playerId = args[0];
    const player = LCS_MANAGER.load('player');
    viewManager.displayToast(playerId === player.id ? 'You have left the game' : 'Your opponent has left the game');
    viewManager.exitGame();

    if (exitedSubscription) {
      session.unsubscribe(exitedSubscription);
    }

    if (moveSubscription) {
      session.unsubscribe(moveSubscription);
    }
  }).then(sub => exitedSubscription = sub);

  viewManager.displayNewGame(player, game, (col, row) => {
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

  const game = LCS_MANAGER.load('game');
  const player = LCS_MANAGER.load('player');
  if (!game || !player) {
    return;
  }

  session.call('ch.comem.archioweb.tictactoe.exitGame', [ game.id, player.id ]);
}

function removeJoinableGame(gameId) {
  viewManager.removeJoinableGame(gameId);
}

function updateBoard(col, row, icon) {
  viewManager.updateBoard(row, col, icon);
}


// ----------------------------------- PLAYER MANAGEMENT


// ----------------------------------- WEBSOCKET MANAGEMENT
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

  session.call('ch.comem.archioweb.tictactoe.getPlayer', []).then(function(player) {
    LCS_MANAGER.save('player', player);

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