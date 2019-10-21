import './sass/main.scss'

global.$ = require("jquery")

const GameController = require('./controller/game.controller')
const PlayerController = require('./controller/player.controller')
const WSFrontendDispatcher = require('./ws-frontend-dispatcher')
const ViewManager = require('./view-manager')

// ---------------- WEBSOCKET MANAGEMENT
const WS_URL = `ws://${window.location.hostname}:8081`

let ws = new WebSocket(WS_URL)

ws.onopen = (e) => {
    console.log("=== CONNECTION OPEN WITH WEBSOCKET ===")


    // ---------------- INIT DISPATCHER
    let wsFrontendDispatcher = new WSFrontendDispatcher()

    // ---------------- INIT VIEW MANAGER
    let viewManager = new ViewManager(ws, wsFrontendDispatcher)

    // ---------------- ADD ROUTE
    wsFrontendDispatcher.addRoute('game', new GameController(viewManager))
    wsFrontendDispatcher.addRoute('player', new PlayerController(viewManager))


    ws.onmessage = (msg) => {
        wsFrontendDispatcher.dispatchFromMsg(msg.data, ws)
    }
}

