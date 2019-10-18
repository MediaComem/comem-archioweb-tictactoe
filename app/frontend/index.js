import './sass/main.scss'

global.$ = require("jquery")

const GameController = require('./controller/game.controller')
const PlayerController = require('./controller/player.controller')
const WSFrontendDispatcher = require('./ws-frontend-dispatcher')
const ViewManager = require('./view-manager')

// ---------------- WEBSOCKET MANAGEMENT
const WS_URL = 'ws://localhost:8081'

let ws = new WebSocket(WS_URL)

ws.onopen = (e) => {
    console.log("=== CONNECTION OPEN WITH WEBSOCKET ===")

    // ---------------- INIT VIEW MANAGER
    let viewManager = new ViewManager(ws)


    let wsFrontendDispatcher = new WSFrontendDispatcher(
        new GameController(viewManager), 
        new PlayerController(viewManager))



    ws.onmessage = (msg) => {
        wsFrontendDispatcher.dispatchFromMsg(msg.data, ws)
    }
}

