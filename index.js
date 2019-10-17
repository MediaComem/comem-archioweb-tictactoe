// --- Library
const express = require('express')
const WebSocket = require('ws')
const WSBackendDispatcher = require('./app/backend/ws-backend-dispatcher')
const WSMessage = require('./app/class/ws-message')
const Player = require('./app/class/player.class')

// --- Const
const PORT = 8080

// --- int express
const app = express()

app.use('/', express.static('public'))

app.listen(PORT, () => { console.log(`=== LISTENING ON ${PORT} ===`) })

// --- init websocket
let clients = []

let wss = new WebSocket.Server({
    port: PORT + 1,
    perMessageDeflate: false
})

let wsBackendDispatcher = new WSBackendDispatcher()
console.log(`=== LISTENING ON ${PORT + 1} ===`)

// --- websocket route
wss.on('connection', (ws) => {
    // Add info on the new connected client    
    let newPlayer = new Player(clients.length+1,"No Name")
    ws.player = newPlayer
    clients.push(ws)

    ws.send(WSMessage.sendResponse(newPlayer,'player','receiveMyPlayer', 200))

    console.log("=== NEW WS CONNECTION ===")
    ws.on('message', (msg) => {
        wsBackendDispatcher.dispatchFromMsg(msg, ws)
    })
})