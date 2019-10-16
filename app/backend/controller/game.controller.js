const Game = require('../class/game.class')


module.exports = class {
    constructor() {
        this.games = Array()
    }

    /**
     * Will instance a new game
     * @param {*} player 
     */
    createNewGame(player) {
        let newGame = new Game(this.games.length+1, player)
        this.games.push(newGame)
        return newGame
    }

    /**
     * Get all joinable game
     */
    getJoinableGame() {
        return this.games.filter((game) => game.state == Game.STATE.CREATED)
    }

    /**
     * 
     * @param {*} player 
     * @param {*} gameId 
     */
    joinGame(player, gameId){
        let gameToJoin = this.games.find((game)=> game.id===gameId)
        gameToJoin.players.push(player)
        return gameToJoin
    }
}