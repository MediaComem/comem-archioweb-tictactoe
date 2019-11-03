/**
 * This file handles backend communication with frontend clients.
 * @exports app/backend/dispatcher
 */
const WebSocket = require('ws');

const GameManager = require('../class/game-manager.class');
const { createLogger } = require('./config');
const GameController = require('./controller/game.controller');
const PlayerController = require('./controller/player.controller');

/**
 * Creates the backend's dispatcher.
 * @param {HttpServer} server - The application's {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server|Node.js HTTP server}.
 */
exports.createBackendDispatcher = function(server) {

  // SETUP
  // =====

  const gameManager = new GameManager();
  const gameController = new GameController(gameManager);
  const logger = createLogger('dispatcher');
  const playerController = new PlayerController(gameManager);

  const clients = {};

  function sendMessageToPlayer(playerId, messageData) {
    const client = clients[playerId];
    if (client) {
      client.send(JSON.stringify(messageData));
    }
  }

  function handleError(playerId, err) {
    sendMessageToPlayer(playerId, {
      resource: 'game',
      command: 'error',
      params: {
        code: err.code,
        message: err.message
      }
    });
  }

  // GAME MANAGEMENT
  // ===============

  function handleCreateGameCommand(playerId) {
    let newGame;

    try {
      newGame = gameController.createNewGame(playerId);
      logger.info(`Player ${playerId} created game ${newGame.id}`);
    } catch (err) {
      return handleError(playerId, err);
    }

    // Tell the frontend client to start the game.
    sendMessageToPlayer(playerId, {
      resource: 'game',
      command: 'startGame',
      params: {
        game: newGame
      }
    });

    // Tell all other frontend clients that a new joinable game is available.
    for (const player of gameManager.players) {
      if (player.id !== playerId) {
        sendMessageToPlayer(player.id, {
          resource: 'game',
          command: 'addJoinableGames',
          params: {
            games: [ newGame ]
          }
        });
      }
    }
  }

  function handleJoinGameCommand(gameId, playerId) {
    let result;

    try {
      result = gameController.joinGame(gameId, playerId);
      logger.info(`Player ${playerId} joined game ${gameId}`);
    } catch (err) {
      return handleError(playerId, err);
    }

    // Tell the frontend client to start the game.
    sendMessageToPlayer(playerId, {
      resource: 'game',
      command: 'startGame',
      params: {
        game: result.game
      }
    });

    // Tell all frontend clients that the game is no longer joinable.
    for (const player of gameManager.players) {
      sendMessageToPlayer(player.id, {
        resource: 'game',
        command: 'removeJoinableGame',
        params: {
          gameId: result.game.id
        }
      });
    }
  }

  function handlePlayCommand(gameId, playerId, col, row) {
    let result;

    try {
      result = gameController.play(gameId, playerId, col, row);
      logger.info(`Player ${playerId} played ${col},${row} in game ${gameId}`);
    } catch (err) {
      return handleError(playerId, err);
    }

    // Check the status of the game.
    let status;
    if (result.win) {
      status = 'win';
    } else if (result.draw) {
      status = 'draw';
    }

    if (status) {
      logger.info(`Game ${gameId} is a ${status}`);
    }

    // Notify the frontend clients connected to the game of the new move and game status.
    for (const player of result.game.players) {
      sendMessageToPlayer(player.id, {
        resource: 'game',
        command: 'updateGame',
        params: {
          col,
          row,
          status,
          icon: result.icon
        }
      });
    }
  }

  function handleLeaveGameCommand(gameId, playerId) {
    let result;

    try {
      result = gameController.leaveGame(gameId, playerId);
      logger.info(`Player ${playerId} exited game ${gameId}`);
    } catch (err) {
      return handleError(playerId, err);
    }

    // Tell the frontend clients connected to the game to leave it.
    for (const player of result.game.players) {
      sendMessageToPlayer(player.id, {
        resource: 'game',
        command: 'leaveGame',
        params: {
          playerId: playerId
        }
      });
    }

    // Tell all frontend clients that the game is no longer joinable.
    for (const player of gameManager.players) {
      sendMessageToPlayer(player.id, {
        resource: 'game',
        command: 'removeJoinableGame',
        params: {
          gameId: result.game.id
        }
      });
    }
  }

  function dispatchGameCommand(command, params, currentPlayer) {
    switch (command) {
      case 'createGame':
        handleCreateGameCommand(currentPlayer.id);
        break;
      case 'joinGame':
        handleJoinGameCommand(params.gameId, currentPlayer.id);
        break;
      case 'play':
        handlePlayCommand(params.gameId, currentPlayer.id, params.col, params.row);
        break;
      case 'leaveGame':
        handleLeaveGameCommand(params.gameId, currentPlayer.id);
        break;
    }
  }

  // COMMUNICATIONS
  // ==============

  const wss = new WebSocket.Server({
    server
  });

  // Handle new client connections.
  wss.on('connection', function(ws) {
    logger.info('New WebSocket client connected');

    // Create a player for each newly connected frontend client.
    const newPlayer = playerController.createPlayer();
    logger.info(`Player ${newPlayer.id} created`);

    // Map the new player's ID to the WebSocket client.
    clients[newPlayer.id] = ws;

    // Forget the mapping when the client disconnects.
    ws.on('close', () => {
      logger.info(`Player ${newPlayer.id} disconnected`);
      gameManager.removePlayer(newPlayer.id);
      delete clients[newPlayer.id];
    });

    // Send the player to the client.
    sendMessageToPlayer(newPlayer.id, {
      resource: 'player',
      command: 'setPlayer',
      params: {
        player: newPlayer
      }
    });

    // Send currently joinable games to the client.
    sendMessageToPlayer(newPlayer.id, {
      resource: 'game',
      command: 'addJoinableGames',
      params: {
        games: gameController.getJoinableGames()
      }
    });

    // Receive and dispatch messages from clients.
    ws.on('message', function(message) {

      logger.debug(`New client message: ${message}`);
      const messageData = JSON.parse(message);

      switch (messageData.resource) {
        case 'game':
          dispatchGameCommand(messageData.command, messageData.params, newPlayer);
          break;
      }
    });
  });
};

/**
 * A {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server|Node.js HTTP server}.
 * @typedef HttpServer
 * @see {@link https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_server}
 */
