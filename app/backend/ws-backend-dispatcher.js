const GameController = require('../backend/controller/game.controller')
const PlayerController = require('../backend/controller/player.controller')
const GameManager = require('../class/game-manager.class')
const WebSocket = require('ws')

const gameManager = new GameManager()
const playerController = new PlayerController(gameManager)
const gameController = new GameController(gameManager)


// ---- GAME MANAGEMENT

// --- init websocket

// --- websocket route
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