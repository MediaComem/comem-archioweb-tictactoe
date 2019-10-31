const GameController = require('../backend/controller/game.controller')
const PlayerController = require('../backend/controller/player.controller')
const GameManager = require('../class/game-manager.class')
const WebSocket = require('ws')

const WS_PORT = Number.parseInt(process.env.PORT) + 1 || 8081

const gameManager = new GameManager()
const playerController = new PlayerController(gameManager)
const gameController = new GameController(gameManager)

let playersWS = {}


/**
 * Will execute the function asked by websocket and send the message to other websocket if
 * necessary for all websocket command linked to the game resource
 * @param {*} command 
 * @param {*} params 
 * @param {*} gameController 
 * @param {*} gameManager 
 * @param {*} actualPlayer 
 * @param {*} playersWS 
 */
const gameDispatcher = (command, params, gameController, gameManager, actualPlayer, playersWS) => {
    switch (command) {
        case 'createNewGame':
            let newGame = gameController.createNewGame(params[0])

            gameManager.players.forEach(player => {
                if (player.id != actualPlayer.id) {
                    playersWS[player.id].send(
                        JSON.stringify({
                            resource: 'game',
                            command: 'newJoinableGame',
                            params: [newGame]
                        })
                    )
                }
            })

            playersWS[actualPlayer.id].send(JSON.stringify({
                resource: 'game',
                command: 'displayNewGame',
                params: [newGame]
            }))

            break;

        case 'updateBoardRequest':
            let boardRequestResult = gameController.updateBoardRequest(params[0], params[1], params[2], params[3])

            if (boardRequestResult === 'noGameFound') {
                return
            }

            if (boardRequestResult === 'invalidMove') {
                playersWS[actualPlayer.id].send(JSON.stringify({
                    resource: 'game',
                    command: 'invalidMove',
                    params: []
                }))

                return
            }

            boardRequestResult.players.forEach(player => {
                let playerWS = playersWS[player.id]

                playerWS.send(JSON.stringify({
                    resource: 'game',
                    command: 'updateBoard',
                    params: [params[2], params[3], boardRequestResult.playerIcon]
                }))

                if (boardRequestResult.hasWin) {
                    playerWS.send(JSON.stringify({
                        resource: 'game',
                        command: 'winMove',
                        params: [actualPlayer.id, boardRequestResult.playerIcon]
                    }))
                } else if (boardRequestResult.draw) {
                    playerWS.send(JSON.stringify({
                        resource: 'game',
                        command: 'drawMove',
                        params: []
                    }))
                }
            })
            break;

        case 'requestJoinGame':
            let joinGameResult = gameController.requestJoinGame(params[0], params[1])

            if (joinGameResult === 'invalidGame') {
                playersWS[actualPlayer.id].send(JSON.stringify({
                    resource: 'game',
                    command: 'invalidGame',
                    params: []
                }))
                return
            }

            playersWS[actualPlayer.id].send(JSON.stringify({
                resource: 'game',
                command: 'displayNewGame',
                params: [joinGameResult.game]
            }))

            joinGameResult.players.forEach(player => {
                playersWS[player.id].send(JSON.stringify({
                    resource: 'game',
                    command: 'removeJoinableGame',
                    params: [joinGameResult.game.id]
                }))
            })

            break;

        case 'exitGame':
            let exitGameResult = gameController.exitGame(params[0], params[1])
            
            exitGameResult.game.players.forEach(player => {
                let msgToSend = player.id === exitGameResult.idPlayerSendingRequest ? 'you have left the game' : 'your opponent has left the game'

                playersWS[player.id].send(JSON.stringify({
                    resource: 'game',
                    command: 'exitGame',
                    params: [msgToSend]
                }))
            })

            exitGameResult.players.forEach(player => {
                playersWS[player.id].send(JSON.stringify({
                    resource: 'game',
                    command: 'removeJoinableGame',
                    params: [exitGameResult.game.id]
                }))
            })

            break;
    }
}

/**
 * Will execute the function asked by websocket and send the message to other websocket if
 * necessary for all websocket command linked to the player resource
 * @param {*} command 
 * @param {*} params 
 * @param {*} playerController 
 * @param {*} gameManager 
 * @param {*} actualPlayer 
 * @param {*} playersWS 
 */
const playerDispatcher = (command, params, playerController, gameManager, actualPlayer, playersWS) => {
    switch (command) {

    }
}

// --- init websocket
let wss = new WebSocket.Server({
    port: WS_PORT,
    perMessageDeflate: false
})

console.log(`=== LISTENING ON ${WS_PORT} ===`)

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
wss.on('connection', (ws) => {


    // --- New player management

    let newPlayer = playerController.createPlayer()

    playersWS[newPlayer.id] = ws

    ws.send(JSON.stringify({
        resource: 'player',
        command: 'receiveMyPlayer',
        params: [newPlayer]
    }))

    gameController.getJoinableGames().forEach(game => {
        ws.send(JSON.stringify({
            resource: 'game',
            command: 'newJoinableGame',
            params: [game]
        }))
    })

    // --- New player message management
    console.log("=== NEW WS CONNECTION ===")
    ws.on('message', (msg) => {
        console.log("=== NEW MESSAGE ===")
        let msgData = JSON.parse(msg)
        console.log(msgData)

        switch (msgData.resource) {
            case 'game':
                gameDispatcher(msgData.command, msgData.params, gameController,
                    gameManager, newPlayer, playersWS)
                break;

            case 'player':
                playerDispatcher(msgData.command, msgData.params, playerController,
                    gameManager, newPlayer, playersWS)
                break;
        }
    })
})