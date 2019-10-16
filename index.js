const express = require('express')
const app = express()
const port = 3000

app.use('/', express.static('public'))

const Game = require('./app/backend/class/game.class');

let game1 = new Game({})

console.log(game1)

app.listen(port, () => {})