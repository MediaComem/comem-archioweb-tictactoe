const Game = require('./game.class')
const Player = require('./player.class')


module.exports = class {
    constructor() {
        this.players = []
        this.games = []
    }

    addPlayer(player) {
        this.players.push(player)
    }

    addGame(game) {
        this.games.push(game)
    }

    getAllCreatedGames() {
        return this.games.filter((game) => game.state == Game.STATE.CREATED)
    }
        
    findGameById(gameId) {
        return this.games.find((game) => game.id === gameId)
    }
}