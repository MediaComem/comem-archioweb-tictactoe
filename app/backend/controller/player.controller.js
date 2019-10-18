const Controller = require('../../class/ws-controller.class')
const Player = require('../../class/player.class')


module.exports = class extends Controller {
    constructor() {
        super('player')
        this.players = []
    }

    createPlayer(ws) {
        let newPlayer = new Player(this.players.length + 1, "No Name", ws)
        this.players.push(newPlayer)
        this.sendResourceMessage('receiveMyPlayer', newPlayer.getWithoutWS(), ws)
    }
}