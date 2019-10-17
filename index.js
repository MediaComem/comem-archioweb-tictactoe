// --- Library
const express = require('express')
const WebSocket = require('ws')
const WSBackendDispatcher = require('./app/backend/ws-backend-dispatcher')

// --- Const
const PORT = 8080

// --- int express
const app = express()

app.use('/', express.static('public'))

app.listen(PORT, () => { console.log(`=== LISTENING ON ${PORT} ===`) })

// --- init websocket

let wss = new WebSocket.Server({
    port: PORT + 1,
    perMessageDeflate: false
})

let wsBackendDispatcher = new WSBackendDispatcher()
console.log(`=== LISTENING ON ${PORT + 1} ===`)

// --- websocket route
wss.on('connection', (ws) => {
    console.log("=== NEW WS CONNECTION ===")
    ws.on('message', (msg) => {
        ws.send(JSON.stringify(wsBackendDispatcher.dispatchFromMsg(msg)))
    })
})