/* eslint-disable no-unused-vars */
const ViewManager = require('./view-manager');

let currentGame;
let currentPlayer;

const viewManager = new ViewManager();

function onError(message) {
  viewManager.displayToast(message);
}

// GAME MANAGEMENT
// ===============

function createGame(ws) {
  if (!currentPlayer) {
    return viewManager.displayToast('No player information available');
  }

  ws.send(JSON.stringify({
    resource: 'game',
    command: 'createGame',
    params: {
      playerId: currentPlayer.id
    }
  }));
}

function exitGame(ws) {
  if (!currentGame || !currentPlayer) {
    return;
  }

  ws.send(JSON.stringify({
    resource: 'game',
    command: 'exitGame',
    params: {
      gameId: currentGame.id,
      playerId: currentPlayer.id
    }
  }));
}

function onStartGame(ws, game) {
  currentGame = game;

  viewManager.displayGame(currentPlayer, game, (col, row) => {
    ws.send(JSON.stringify({
      resource: 'game',
      command: 'play',
      params: {
        col,
        row,
        gameId: game.id,
        playerId: currentPlayer.id
      }
    }));
  });
}

function onUpdateGame(col, row, icon, status) {
  viewManager.updateBoard(col, row, icon);
  if (status === 'win') {
    viewManager.displayToast(`${icon} wins!`);
  } else if (status === 'draw') {
    viewManager.displayToast('Draw!');
  }
}

function onAddGames(ws, games) {
  games.forEach(game => {
    viewManager.addGame(currentPlayer, game, (gameId, playerId) => {
      ws.send(JSON.stringify({
        resource: 'game',
        command: 'joinGame',
        params: { gameId, playerId }
      }));
    });
  });
}

function onExitGame(params) {
  viewManager.displayToast(params.playerId === currentPlayer.id ? 'You have left the game' : 'Your opponent has left the game');
  viewManager.exitGame();
}

function onRemoveGame(gameId) {
  viewManager.removeGame(gameId);
}

function dispatchGameEvent(command, params, ws) {
  switch (command) {
    case 'error':
      onError(`Game error: ${params.message}`);
      break;

    case 'addGames':
      onAddGames(ws, params.games);
      break;

    case 'startGame':
      onStartGame(ws, params.game);
      break;

    case 'updateGame':
      onUpdateGame(params.col, params.row, params.icon, params.status);
      break;

    case 'removeGame':
      onRemoveGame(params.gameId);
      break;

    case 'exitGame':
      onExitGame(params);
      break;
  }
}

// PLAYER MANAGEMENT
// =================

function onSetPlayer(player) {
  currentPlayer = player;
  console.log(`Player ID is ${currentPlayer.id}`);
}

function dispatchPlayerEvent(command, params) {
  switch (command) {
    case 'setPlayer':
      onSetPlayer(params.player);
      break;
  }
}

// COMMUNICATIONS
// ==============

const WS_URL = `ws://${window.location.hostname}:${window.location.port}`;
const ws = new WebSocket(WS_URL);

ws.onopen = () => {
  console.log(`Connected to WebSockets server at ${WS_URL}`);

  // Handle clicks on Create & Exit Game.
  viewManager.initEventManager(
    () => createGame(ws),
    () => exitGame(ws)
  );

  ws.onmessage = msg => {

    console.log(`Received message from server: ${msg.data}`);
    const msgData = JSON.parse(msg.data);

    /**
     * Message data structure :
     * {
     *   "resource": "[RESOURCE_NAME]"".
     *   "command": "[COMMAND_NAME]"",
     *   "params": [
     *       ...
     *   ]
     *
     */
    switch (msgData.resource) {
      case 'game':
        dispatchGameEvent(msgData.command, msgData.params, ws);
        break;
      case 'player':
        dispatchPlayerEvent(msgData.command, msgData.params, ws);
        break;
    }
  };
};
