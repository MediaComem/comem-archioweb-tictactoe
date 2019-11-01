/* eslint-disable no-unused-vars */
const WebSocket = require('ws');

const GameManager = require('../class/game-manager.class');
const { createLogger } = require('./config');
const GameController = require('./controller/game.controller');
const PlayerController = require('./controller/player.controller');

const gameManager = new GameManager();
const gameController = new GameController(gameManager);
const logger = createLogger('dispatcher');
const playerController = new PlayerController(gameManager);

const clients = {};

// GAME MANAGEMENT
// ===============

const gameDispatcher = (command, params, actualPlayer) => {
  switch (command) {
    case 'createGame':
      const newGame = gameController.createNewGame(params.playerId);
      logger.info(`Player ${params.playerId} created game ${newGame.id}`);

      gameManager.players.forEach(player => {
        if (player.id !== actualPlayer.id) {
          clients[player.id].send(
            JSON.stringify({
              resource: 'game',
              command: 'addGames',
              params: {
                games: [ newGame ]
              }
            })
          );
        }
      });

      clients[actualPlayer.id].send(JSON.stringify({
        resource: 'game',
        command: 'startGame',
        params: {
          game: newGame
        }
      }));

      break;

    case 'play':
      const boardRequestResult = gameController.play(params.gameId, params.playerId, params.col, params.row);
      if (boardRequestResult === 'invalidGame') {
        return clients[actualPlayer.id].send(JSON.stringify({
          resource: 'game',
          command: 'error',
          params: {
            message: 'no such game'
          }
        }));
      } else if (boardRequestResult === 'invalidMove') {
        return clients[actualPlayer.id].send(JSON.stringify({
          resource: 'game',
          command: 'error',
          params: {
            message: 'invalid move'
          }
        }));
      }

      logger.info(`Player ${params.playerId} played ${params.col},${params.row} in game ${params.gameId}`);

      let status;
      if (boardRequestResult.hasWin) {
        status = 'win';
      } else if (boardRequestResult.draw) {
        status = 'draw';
      }

      if (status) {
        logger.info(`Game ${params.gameId} is a ${status}`);
      }

      boardRequestResult.players.forEach(player => {
        const playerWS = clients[player.id];

        playerWS.send(JSON.stringify({
          resource: 'game',
          command: 'updateGame',
          params: {
            col: params.col,
            row: params.row,
            icon: boardRequestResult.playerIcon,
            status: status
          }
        }));
      });
      break;

    case 'joinGame':
      const joinGameResult = gameController.joinGame(params.gameId, params.playerId);

      if (joinGameResult === 'invalidGame') {
        clients[actualPlayer.id].send(JSON.stringify({
          resource: 'game',
          command: 'error',
          params: {
            message: 'no such game'
          }
        }));
        return;
      }

      logger.info(`Player ${params.playerId} joined game ${params.gameId}`);

      clients[actualPlayer.id].send(JSON.stringify({
        resource: 'game',
        command: 'startGame',
        params: {
          game: joinGameResult.game
        }
      }));

      joinGameResult.players.forEach(player => {
        clients[player.id].send(JSON.stringify({
          resource: 'game',
          command: 'removeGame',
          params: {
            gameId: joinGameResult.game.id
          }
        }));
      });

      break;

    case 'exitGame':
      const exitGameResult = gameController.exitGame(params.gameId, params.playerId);

      logger.info(`Player ${params.playerId} exited game ${params.gameId}`);

      exitGameResult.game.players.forEach(player => {
        clients[player.id].send(JSON.stringify({
          resource: 'game',
          command: 'exitGame',
          params: {
            playerId: params.playerId
          }
        }));
      });

      gameManager.players.forEach(player => {
        clients[player.id].send(JSON.stringify({
          resource: 'game',
          command: 'removeGame',
          params: {
            gameId: exitGameResult.game.id
          }
        }));
      });

      break;
  }
};

// COMMUNICATIONS
// ==============

exports.createDispatcher = function(server) {

  const wss = new WebSocket.Server({
    server: server,
    perMessageDeflate: false
  });

  wss.on('connection', ws => {
    logger.info('New WS client connection');

    // Create a player for each newly connected client.
    const newPlayer = playerController.createPlayer();

    // Store a mapping between the new player's ID and the WebSockets client.
    clients[newPlayer.id] = ws;

    // Send the player to the client.
    ws.send(JSON.stringify({
      resource: 'player',
      command: 'setPlayer',
      params: {
        player: newPlayer
      }
    }));

    // Send currently joinable games to the client.
    const currentGames = gameController.getJoinableGames();
    ws.send(JSON.stringify({
      resource: 'game',
      command: 'addGames',
      params: {
        games: currentGames
      }
    }));

    // Receive and dispatch messages from clients.
    ws.on('message', msg => {

      logger.debug(`New client message: ${msg}`);
      const msgData = JSON.parse(msg);

      switch (msgData.resource) {
        case 'game':
          gameDispatcher(msgData.command, msgData.params, newPlayer);
          break;
      }
    });
  });
};
