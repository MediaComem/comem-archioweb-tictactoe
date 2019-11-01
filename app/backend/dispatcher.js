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

const playersWS = {};

// GAME MANAGEMENT
// ===============

const gameDispatcher = (command, params, actualPlayer) => {
  switch (command) {
    case 'createNewGame':
      const newGame = gameController.createNewGame(params[0]);

      gameManager.players.forEach(player => {
        if (player.id !== actualPlayer.id) {
          playersWS[player.id].send(
            JSON.stringify({
              resource: 'game',
              command: 'newJoinableGame',
              params: [ newGame ]
            })
          );
        }
      });

      playersWS[actualPlayer.id].send(JSON.stringify({
        resource: 'game',
        command: 'displayNewGame',
        params: [ newGame ]
      }));

      break;

    case 'updateBoardRequest':
      const boardRequestResult = gameController.updateBoardRequest(params[0], params[1], params[2], params[3]);

      if (boardRequestResult === 'noGameFound') {
        return;
      }

      if (boardRequestResult === 'invalidMove') {
        playersWS[actualPlayer.id].send(JSON.stringify({
          resource: 'game',
          command: 'invalidMove',
          params: []
        }));

        return;
      }

      boardRequestResult.players.forEach(player => {
        const playerWS = playersWS[player.id];

        playerWS.send(JSON.stringify({
          resource: 'game',
          command: 'updateBoard',
          params: [ params[2], params[3], boardRequestResult.playerIcon ]
        }));

        if (boardRequestResult.hasWin) {
          playerWS.send(JSON.stringify({
            resource: 'game',
            command: 'winMove',
            params: [ actualPlayer.id, boardRequestResult.playerIcon ]
          }));
        } else if (boardRequestResult.draw) {
          playerWS.send(JSON.stringify({
            resource: 'game',
            command: 'drawMove',
            params: []
          }));
        }
      });
      break;

    case 'requestJoinGame':
      const joinGameResult = gameController.requestJoinGame(params[0], params[1]);

      if (joinGameResult === 'invalidGame') {
        playersWS[actualPlayer.id].send(JSON.stringify({
          resource: 'game',
          command: 'invalidGame',
          params: []
        }));
        return;
      }

      playersWS[actualPlayer.id].send(JSON.stringify({
        resource: 'game',
        command: 'displayNewGame',
        params: [ joinGameResult.game ]
      }));

      joinGameResult.players.forEach(player => {
        playersWS[player.id].send(JSON.stringify({
          resource: 'game',
          command: 'removeJoinableGame',
          params: [ joinGameResult.game.id ]
        }));
      });

      break;

    case 'exitGame':
      const exitGameResult = gameController.exitGame(params[0], params[1]);

      exitGameResult.game.players.forEach(player => {
        const msgToSend = player.id === exitGameResult.idPlayerSendingRequest ? 'you have left the game' : 'your opponent has left the game';

        playersWS[player.id].send(JSON.stringify({
          resource: 'game',
          command: 'exitGame',
          params: [ msgToSend ]
        }));
      });

      exitGameResult.players.forEach(player => {
        playersWS[player.id].send(JSON.stringify({
          resource: 'game',
          command: 'removeJoinableGame',
          params: [ exitGameResult.game.id ]
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

    playersWS[newPlayer.id] = ws;

    ws.send(JSON.stringify({
      resource: 'player',
      command: 'receiveMyPlayer',
      params: [ newPlayer ]
    }));

    gameController.getJoinableGames().forEach(game => {
      ws.send(JSON.stringify({
        resource: 'game',
        command: 'newJoinableGame',
        params: [ game ]
      }));
    });

    // Dispatch messages from clients.
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
