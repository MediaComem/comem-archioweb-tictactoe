const Player = require('../../class/player.class')


module.exports = class {
    constructor(gameManager) {
        this.gameManager = gameManager
    }

    createPlayer() {
        let newPlayer = new Player(this.gameManager.players.length + 1, "No Name")
        this.gameManager.addPlayer(newPlayer)

        return newPlayer
    }
}