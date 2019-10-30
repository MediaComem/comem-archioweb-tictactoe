const LCS_MANAGER = require('./localstorage-manager')
const Game = require('../class/game.class')


// ----------------------------------- CONSTANT DEFINITION
const WS_URL = `ws://${window.location.hostname}:${Number.parseInt(window.location.port) + 1}`
console.log(WS_URL)

// ----------------------------------- WEBSOCKET INIT
let ws = new WebSocket(WS_URL)

// ----------------------------------- DOM MANAGEMENT
// When dom ready
$(() => {
    // ----------------------------------- CONST DOM ELEMENT DEFINITION
    const SHOWGAME_CONTAINER = $('.showgame-container')
    const CREATEGAME_CONTAINER = $('.creategame-container')
    const INFOPLAYER_CONTAINER = $(".info-player")
    const BOARD_GRID = $('.board')
    const GAME_CONTAINER = $('.game')

    const TMP_BOARD_BTN = $('.tmp.board-btn', CREATEGAME_CONTAINER).remove().removeClass('tmp').clone()
    const TMP_JOINABLE_GAME = $('.tmp.joinable-game').removeClass('tmp').remove().clone()

    const BTN_CREATE_NEWGAME = $('#createNewGame')
    const BTN_EXIT_GAME = $('#exit-game')

    const INPT_SEARCH_GAME = $('#searchbyplayer')

    // ----------------------------------- APP INIT
    CREATEGAME_CONTAINER.hide()
    BTN_CREATE_NEWGAME.attr('disabled')

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
        let boardOfGameInstance = gameInstance.board
        let playerIcon = gameInstance.getPlayerIcon(player.id)
        let playerTurnIcon = gameInstance.getPlayerTurnIcon()

        boardOfGameInstance.forEach((row, i) => {
            row.forEach((col, j) => {
                let boardBtn = TMP_BOARD_BTN.clone()

                boardBtn.addClass('EMPTY')

                boardBtn.on('click', (evt) => {
                    ws.send(JSON.stringify({
                        resource: 'game',
                        command: 'updateBoardRequest',
                        params: [game.id, player.id, i, j]
                    }))
                })

                BOARD_GRID.append(boardBtn)
            })
        })

        $('.info-player-icon', INFOPLAYER_CONTAINER).addClass(playerIcon)
        $('.info-player-icon', INFOPLAYER_CONTAINER).text(playerIcon)

        BOARD_GRID.addClass(`${playerTurnIcon}-turn`)

        SHOWGAME_CONTAINER.hide()
        CREATEGAME_CONTAINER.show()
    }

    const updateBoard = (row, col, icon) => {
        let boardBtn = BOARD_GRID.children().eq(row * 3 + col)
        boardBtn.text(icon)
        boardBtn.removeClass('EMPTY')
        boardBtn.addClass(icon.toUpperCase())

        BOARD_GRID.removeClass(`${icon.toUpperCase()}-turn`)
        BOARD_GRID.addClass(`${icon.toUpperCase() === 'O' ? 'X' : 'O'}-turn`)
    }

    const addNewJoinableGame = (ws, game) => {
        let joinableGame = TMP_JOINABLE_GAME.clone()
        let player = LCS_MANAGER.load('player')

        joinableGame.attr('data-player', `${game.players[0].id} - ${game.players[0].username}`)
        joinableGame.attr('data-gameid', `${game.id}`)

        $('.playerid', joinableGame).text(`#${game.players[0].id}`)
        $('.playername', joinableGame).text(game.players[0].username)

        $('.join-btn', joinableGame).on('click', (e) => {
            ws.send(JSON.stringify({
                resource: 'game',
                command: 'requestJoinGame',
                params: [game.id, player.id]
            }))
        })

        $(".games", SHOWGAME_CONTAINER).append(joinableGame)
    }

    const removeJoinableGame = (gameId) => {
        $(".games", SHOWGAME_CONTAINER).children().each((i, ele) => {
            if ($(ele).attr('data-gameid') == gameId) {
                $(ele).fadeOut("fast").remove()
            }
        })
    }

    const exitGame = () => {
        SHOWGAME_CONTAINER.show()
        GAME_CONTAINER.hide()

        BOARD_GRID.attr('class', 'board')
        BOARD_GRID.children().each((i, ele) => $(ele).remove())

        $('.info-player-icon', INFOPLAYER_CONTAINER).attr('class', 'info-player-icon')
        $('.info-player-icon', INFOPLAYER_CONTAINER).text('')

    }

    const dispatchGameCommand = (command, params, ws) => {
        switch (command) {
            case 'newJoinableGame':
                addNewJoinableGame(ws, params[0])
                break;

            case 'displayNewGame':
                displayNewGame(ws, params[0])
                break;

            case 'updateBoard':
                console.log(params)
                updateBoard(params[0], params[1], params[2])
                break;

            case 'winMove':
                alert(`${params[1]} win.`)
                break;

            case 'drawMove':
                alert('Draw !')
                break;

            case 'invalidMove':
                alert('Move invalid')
                break;

            case 'removeJoinableGame':
                removeJoinableGame(params[0])
                break;

            case 'invalidGame':
                break;

            case 'exitGame':
                alert(params[0])
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
        BTN_CREATE_NEWGAME.click(() => {
            createNewGame(ws)
        })

        BTN_EXIT_GAME.click(() => {
            exitGameRequest(ws)
        })

        INPT_SEARCH_GAME.keyup(() => {
            GAME_CONTAINER.children().each((i, ele) => {
                if ($(ele).attr('data-player').includes(inputText) || inputText == '') {
                    $(ele).fadeIn('slow')
                } else {
                    $(ele).fadeOut('slow')
                }
            })
        })


        ws.onmessage = (msg) => {
            console.log('=== NEW MESSAGE ===')
            let msgData = JSON.parse(msg.data)
            console.log(msgData)
            /*
                Message data structure :
                {
                    'resource':'[RESOURCE_NAME]'
                    'command':'[COMMAND_NAME'],
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


})