const LCS_MANAGER = require('./localstorage-manager')
const Game = require('../class/game.class')
const ViewManager = require('./view-manager')

// ----------------------------------- CONSTANT DEFINITION
const WS_URL = `ws://${window.location.hostname}:${Number.parseInt(window.location.port) + 1}`

// ----------------------------------- WEBSOCKET INIT
let ws = new WebSocket(WS_URL)

const viewManager = new ViewManager()

// ----------------------------------- GAME MANAGEMENT    

const createNewGame = (ws) => {
    let player = LCS_MANAGER.load('player')

    if (!player) {
        console.error('No player defined')
        return
    }

    ws.send(JSON.stringify({
        resource: 'game',
        command: 'createNewGame',
        params: [player]
    }))
}

const exitGameRequest = (ws) => {
    let game = LCS_MANAGER.load('game')
    let player = LCS_MANAGER.load('player')

    if (!game || !player) {
        return
    }

    ws.send(JSON.stringify({
        resource: 'game',
        command: 'exitGame',
        params: [game.id, player.id]
    }))
}

const displayNewGame = (ws, game) => {
    let player = LCS_MANAGER.load('player')
    LCS_MANAGER.save('game', game)

    let gameInstance = new Game()
    Object.assign(gameInstance, game)

    viewManager.displayNewGame(gameInstance.board,
        gameInstance.getPlayerIcon(player.id),
        gameInstance.getPlayerTurnIcon(),
        (col, row) => {
            ws.send(JSON.stringify({
                resource: 'game',
                command: 'updateBoardRequest',
                params: [game.id, player.id, col, row]
            }))
        })
}

const updateBoard = (row, col, icon) => {
    viewManager.updateBoard(row, col, icon)
}

const addNewJoinableGame = (ws, game) => {
    let player = LCS_MANAGER.load('player')

    viewManager.addNewJoinableGame(player, game, (gameId, playerId) => {
        ws.send(JSON.stringify({
            resource: 'game',
            command: 'requestJoinGame',
            params: [gameId, playerId]
        }))
    })
}

const removeJoinableGame = (gameId) => {
    viewManager.removeJoinableGame(gameId)
}

const exitGame = () => {
    viewManager.exitGame()
}

const dispatchGameCommand = (command, params, ws) => {
    switch (command) {
        case 'newJoinableGame':
            let newJoinableGame = params[0]
            addNewJoinableGame(ws, newJoinableGame)
            break;

        case 'displayNewGame':
            let newGame = params[0]
            displayNewGame(ws, newGame)
            break;

        case 'updateBoard':
            let row = params[0]
            let col = params[1]
            let icon = params[2]
            updateBoard(row, col, icon)
            break;

        case 'winMove':
            let winIcon = params[1]
            viewManager.displayToast(`${winIcon} win.`)
            break;

        case 'drawMove':
            viewManager.displayToast('Draw !')
            break;

        case 'invalidMove':
            viewManager.displayToast('Move invalid')
            break;

        case 'removeJoinableGame':
            let gameToRemove = params[0]
            removeJoinableGame(gameToRemove)
            break;

        case 'invalidGame':
            break;

        case 'exitGame':
            let exitMsg = params[0]
            viewManager.displayToast(exitMsg)
            exitGame(ws)
            break;
    }
}

// ----------------------------------- PLAYER MANAGEMENT

const receiveMyPlayer = (playerFromServer) => {
    LCS_MANAGER.save('player', playerFromServer)
}

const dispatchPlayerCommand = (command, params, ws) => {
    switch (command) {
        case 'receiveMyPlayer':
            receiveMyPlayer(params[0])
            break;
    }
}

// ----------------------------------- WEBSOCKET MANAGEMENT
ws.onopen = (e) => {
    console.log("=== CONNECTION OPEN WITH WEBSOCKET ===")

    // ----------------------------------- DOM EVENT MANAGEMENT
    viewManager.initEventManager(
        () => createNewGame(ws),
        () => exitGameRequest(ws)
    )

    ws.onmessage = (msg) => {
        console.log('=== NEW MESSAGE ===')
        let msgData = JSON.parse(msg.data)
        console.log(msgData)
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
                dispatchGameCommand(msgData.command, msgData.params, ws)
                break;

            case 'player':
                dispatchPlayerCommand(msgData.command, msgData.params, ws)
                break;
        }
    }
}
