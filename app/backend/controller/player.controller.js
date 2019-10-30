const Controller = require('../../class/ws-controller.class')
const Player = require('../../class/player.class')


module.exports = class extends Controller {
    constructor(gameManager) {
        super('player')
        this.gameManager = gameManager
    }

    createPlayer(ws) {
        let newPlayer = new Player(this.gameManager.players.length + 1, "No Name", ws)
        this.gameManager.addPlayer(newPlayer)
        this.sendResourceMessage('receiveMyPlayer', [newPlayer.getWithoutWS()], ws)
    }
}