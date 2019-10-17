const Game = require('../../class/game.class')
const Controller = require('../../class/controller.class')


module.exports = class extends Controller {
    constructor() {
        super('game')
        this.games = Array()
    }

    /**
     * Will instance a new game
     * @param {*} player 
     */
    createNewGame(player) {
        let newGame = new Game(this.games.length + 1, player)
        this.games.push(newGame)

        return this.sendOK(newGame, 'newGame')
    }

    /**
     * Get all joinable game
     */
    getJoinableGame() {
        return  this.sendOK(this.games.filter((game) => game.state == Game.STATE.CREATED), 'joinableGames')
    }

    /**
     * 
     * @param {*} player 
     * @param {*} gameId 
     */
    joinGame(player, gameId) {
        let gameToJoin = this.games.find((game) => game.id === gameId)
        gameToJoin.players.push(player)
        return this.sendOK(gameToJoin, 'joinningGame')
    }
}