import './sass/main.scss'

global.$ = require("jquery")

const GameController = require('./controller/game.controller')
const PlayerController = require('./controller/player.controller')
const WSFrontendDispatcher = require('./ws-frontend-dispatcher')

// ---------------- INIT
let btnCreateNewGame = $('#createNewGame')
btnCreateNewGame.attr('disabled')

// ---------------- SIMPLE ROUTING MANAGEMENT
let showgameContainer = $('.showgame-container')
let creategameContainer = $('.creategame-container')

creategameContainer.toggle()


// ---------------- TEMPLATING
const TMP_JOINABLE_GAME = $('.tmp.joinable-game').remove().clone()

// ---------------- EVENT MANAGER

// ---------------- WEBSOCKET MANAGEMENT
const WS_URL = 'ws://localhost:8081'

let ws = new WebSocket(WS_URL)

ws.onopen = (e) => {
    console.log("=== CONNECTION OPEN WITH WEBSOCKET ===")
    let gameController = new GameController(creategameContainer)
    let playerController = new PlayerController()

    let wsFrontendDispatcher = new WSFrontendDispatcher(gameController, playerController)

    // ---------------- EVENT LINKED TO WEBSOCKET MANAGER
    $('#createNewGame').on('click', (evt) => {
        showgameContainer.toggle()
        creategameContainer.toggle()
        gameController.createGame(ws)
    })

    ws.onmessage = (msg) => {
        wsFrontendDispatcher.dispatchFromMsg(msg.data, ws)
    }
}

