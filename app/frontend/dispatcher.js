/* eslint-disable no-unused-vars */
const ViewManager = require('./view-manager');

let currentGame;
let currentPlayer;

const viewManager = new ViewManager();

// GAME MANAGEMENT
// ===============

const createNewGame = ws => {
  if (!currentPlayer) {
    return viewManager.displayToast('No player information available');
  }

  ws.send(JSON.stringify({
    resource: 'game',
    command: 'createNewGame',
    params: [ currentPlayer.id ]
  }));
};

const exitGameRequest = ws => {
  if (!currentGame || !currentPlayer) {
    return;
  }

  ws.send(JSON.stringify({
    resource: 'game',
    command: 'exitGame',
    params: [ currentGame.id, currentPlayer.id ]
  }));
};

const displayNewGame = (ws, game) => {
  currentGame = game;

  viewManager.displayNewGame(currentPlayer, game, (col, row) => {
    ws.send(JSON.stringify({
      resource: 'game',
      command: 'updateBoardRequest',
      params: [ game.id, currentPlayer.id, col, row ]
    }));
  });
};

const updateBoard = (row, col, icon) => {
  viewManager.updateBoard(col, row, icon);
};

const addNewJoinableGame = (ws, game) => {
  viewManager.addNewJoinableGame(currentPlayer, game, (gameId, playerId) => {
    ws.send(JSON.stringify({
      resource: 'game',
      command: 'requestJoinGame',
      params: [ gameId, playerId ]
    }));
  });
};

const removeJoinableGame = gameId => {
  viewManager.removeJoinableGame(gameId);
};

const exitGame = () => {
  viewManager.exitGame();
};

const dispatchGameCommand = (command, params, ws) => {
  switch (command) {
    case 'newJoinableGame':
      const newJoinableGame = params[0];
      addNewJoinableGame(ws, newJoinableGame);
      break;

    case 'displayNewGame':
      const newGame = params[0];
      displayNewGame(ws, newGame);
      break;

    case 'updateBoard':
      const row = params[0];
      const col = params[1];
      const icon = params[2];
      updateBoard(row, col, icon);
      break;

    case 'winMove':
      const winIcon = params[1];
      viewManager.displayToast(`${winIcon} win.`);
      break;

    case 'drawMove':
      viewManager.displayToast('Draw !');
      break;

    case 'invalidMove':
      viewManager.displayToast('Move invalid');
      break;

    case 'removeJoinableGame':
      const gameToRemove = params[0];
      removeJoinableGame(gameToRemove);
      break;

    case 'invalidGame':
      break;

    case 'exitGame':
      const exitMsg = params[0];
      viewManager.displayToast(exitMsg);
      exitGame(ws);
      break;
  }
};

// PLAYER MANAGEMENT
// =================

const receiveMyPlayer = playerFromServer => {
  currentPlayer = playerFromServer;
};

const dispatchPlayerCommand = (command, params) => {
  switch (command) {
    case 'receiveMyPlayer':
      const playerFromServer = params[0];
      receiveMyPlayer(playerFromServer);
      break;
  }
};

// COMMUNICATIONS
// ==============

const WS_URL = `ws://${window.location.hostname}:${window.location.port}`;
const ws = new WebSocket(WS_URL);

// ----------------------------------- WEBSOCKET MANAGEMENT
ws.onopen = () => {
  console.log('=== CONNECTION OPEN WITH WEBSOCKET ===');

  // ----------------------------------- DOM EVENT MANAGEMENT
  viewManager.initEventManager(
    () => createNewGame(ws),
    () => exitGameRequest(ws)
  );

  ws.onmessage = msg => {
    console.log('=== NEW MESSAGE ===');
    const msgData = JSON.parse(msg.data);
    console.log(msgData);
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

    switch (msgData.resource) {
      case 'game':
        dispatchGameCommand(msgData.command, msgData.params, ws);
        break;

      case 'player':
        dispatchPlayerCommand(msgData.command, msgData.params, ws);
        break;
    }
  };
};
