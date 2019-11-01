const LCS_MANAGER = require('./localstorage-manager');
const ViewManager = require('./view-manager');

const viewManager = new ViewManager();

// GAME MANAGEMENT
// ===============

const createNewGame = ws => {
  const player = LCS_MANAGER.load('player');

  if (!player) {
    console.error('No player defined');
    return;
  }

  ws.send(JSON.stringify({
    resource: 'game',
    command: 'createNewGame',
    params: [ player.id ]
  }));
};

const exitGameRequest = ws => {
  const game = LCS_MANAGER.load('game');
  const player = LCS_MANAGER.load('player');

  if (!game || !player) {
    return;
  }

  ws.send(JSON.stringify({
    resource: 'game',
    command: 'exitGame',
    params: [ game.id, player.id ]
  }));
};

const displayNewGame = (ws, game) => {
  const player = LCS_MANAGER.load('player');
  LCS_MANAGER.save('game', game);

  viewManager.displayNewGame(player, game, (col, row) => {
    ws.send(JSON.stringify({
      resource: 'game',
      command: 'updateBoardRequest',
      params: [ game.id, player.id, col, row ]
    }));
  });
};

const updateBoard = (row, col, icon) => {
  viewManager.updateBoard(col, row, icon);
};

const addNewJoinableGame = (ws, game) => {
  const player = LCS_MANAGER.load('player');

  viewManager.addNewJoinableGame(player, game, (gameId, playerId) => {
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
  LCS_MANAGER.save('player', playerFromServer);
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

const WS_URL = `ws://${window.location.hostname}:${parseInt(window.location.port, 10) + 1}`;
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
