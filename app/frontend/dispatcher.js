/**
 * This file handles the frontend client's communications with the backend.
 * @module app/frontend/dispatcher
 */

/**
 * Creates the frontend's dispatcher.
 * @param {ViewManager} viewManager - The frontend's view manager.
 */
export function createFrontendDispatcher(viewManager) {

  // SETUP
  // =====

  let currentGame;
  let currentPlayer;

  function handleError(message, code) {
    console.warn(`ERROR: received error code ${code} from backend`);
    viewManager.displayToast(message);
  }

  // GAME MANAGEMENT
  // ===============

  function onCreateGameClicked(ws) {
    if (!currentPlayer) {
      return viewManager.displayToast('No player information available');
    }

    ws.send(JSON.stringify({
      resource: 'game',
      command: 'createGame',
      params: {}
    }));
  }

  function onJoinGameClicked(ws, gameId) {
    ws.send(JSON.stringify({
      resource: 'game',
      command: 'joinGame',
      params: {
        gameId
      }
    }));
  }

  function onBoardCellClicked(ws, col, row) {
    ws.send(JSON.stringify({
      resource: 'game',
      command: 'play',
      params: {
        col,
        row,
        gameId: currentGame.id
      }
    }));
  }

  function onLeaveGameClicked(ws) {
    if (!currentGame || !currentPlayer) {
      return;
    }

    ws.send(JSON.stringify({
      resource: 'game',
      command: 'leaveGame',
      params: {
        gameId: currentGame.id
      }
    }));
  }

  function handleStartGameCommand(game) {
    currentGame = game;
    viewManager.displayGame(game, currentPlayer);
  }

  function handleUpdateGameCommand(col, row, icon, status) {
    viewManager.updateBoard(col, row, icon);
    if (status === 'win') {
      viewManager.displayToast(`${icon} wins!`);
    } else if (status === 'draw') {
      viewManager.displayToast('Draw!');
    }
  }

  function handleAddJoinableGamesCommand(games) {
    for (const game of games) {
      viewManager.addJoinableGame(game);
    }
  }

  function handleLeaveGameCommand(params) {
    viewManager.displayToast(params.playerId === currentPlayer.id ? 'You have left the game' : 'Your opponent has left the game');
    viewManager.leaveGame();
  }

  function handleRemoveJoinableGameCommand(gameId) {
    viewManager.removeJoinableGame(gameId);
  }

  function dispatchGameCommand(command, params) {
    switch (command) {
      case 'error':
        handleError(params.message, params.code);
        break;
      case 'addJoinableGames':
        handleAddJoinableGamesCommand(params.games);
        break;
      case 'startGame':
        handleStartGameCommand(params.game);
        break;
      case 'updateGame':
        handleUpdateGameCommand(params.col, params.row, params.icon, params.status);
        break;
      case 'removeJoinableGame':
        handleRemoveJoinableGameCommand(params.gameId);
        break;
      case 'leaveGame':
        handleLeaveGameCommand(params);
        break;
    }
  }

  // PLAYER MANAGEMENT
  // =================

  function handleSetPlayerCommand(player) {
    currentPlayer = player;
    console.log(`Player ID is ${currentPlayer.id}`);
  }

  function dispatchPlayerCommand(command, params) {
    switch (command) {
      case 'setPlayer':
        handleSetPlayerCommand(params.player);
        break;
    }
  }

  // COMMUNICATIONS
  // ==============

  // Open a WebSocket connection to the backend.
  const wsProtocol = window.location.protocol.startsWith('https') ? 'wss' : 'ws';
  const wsUrl = `${wsProtocol}://${window.location.hostname}:${window.location.port}`;
  const ws = new WebSocket(wsUrl);

  ws.addEventListener('open', function() {
    console.log(`Connected to WebSocket server at ${wsUrl}`);

    // Handle DOM events.
    viewManager.on('createGame', () => onCreateGameClicked(ws));
    viewManager.on('joinGame', gameId => onJoinGameClicked(ws, gameId));
    viewManager.on('play', (col, row) => onBoardCellClicked(ws, col, row));
    viewManager.on('leaveGame', () => onLeaveGameClicked(ws));

    // Dispatch backend messages.
    ws.addEventListener('message', function(message) {

      console.log(`Received message from the backend: ${message.data}`);
      const messageData = JSON.parse(message.data);

      /**
       * Message data format:
       * {
       *   "resource": "<game|player>".
       *   "command": "<command>",
       *   "params": {
       *       ...
       *   }
       * }
       */
      switch (messageData.resource) {
        case 'game':
          dispatchGameCommand(messageData.command, messageData.params);
          break;
        case 'player':
          dispatchPlayerCommand(messageData.command, messageData.params);
          break;
      }
    });
  });
}
