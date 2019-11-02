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

  function handleError(message) {
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

  function onBoardClicked(ws, col, row) {
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
        handleError(`Game error: ${params.message}`);
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

  const WS_URL = `ws://${window.location.hostname}:${window.location.port}`;
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log(`Connected to WebSockets server at ${WS_URL}`);

    // Handle DOM events.
    viewManager.on('createGame', () => onCreateGameClicked(ws));
    viewManager.on('joinGame', gameId => onJoinGameClicked(ws, gameId));
    viewManager.on('play', (col, row) => onBoardClicked(ws, col, row));
    viewManager.on('leaveGame', () => onLeaveGameClicked(ws));

    // Dispatch server messages.
    ws.onmessage = msg => {

      console.log(`Received message from server: ${msg.data}`);
      const msgData = JSON.parse(msg.data);

      /**
       * Message format:
       * {
       *   "resource": "<game|player>".
       *   "command": "<command>",
       *   "params": {
       *       ...
       *   }
       * }
       */
      switch (msgData.resource) {
        case 'game':
          dispatchGameCommand(msgData.command, msgData.params);
          break;
        case 'player':
          dispatchPlayerCommand(msgData.command, msgData.params);
          break;
      }
    };
  };
}
