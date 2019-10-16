// --- Library
const express = require('express')
const WebSocket = require('ws')

// --- Const
const PORT = 8080

// --- int express
const app = express()

app.use('/', express.static('public'))

app.listen(PORT, () => { })

// --- init websocket

let wss = new WebSocket.Server({
    port: PORT + 1,
    perMessageDeflate: false
})

// --- websocket route
wss.on('connection', (ws)=> {
    ws.on('message', (msg)=> {
        
    })
})