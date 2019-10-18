const Game = require('../../class/game.class')
const Controller = require('../../class/ws-controller.class')

module.exports = class extends Controller {
    constructor() {
        super('game')
        this.games = Array()
    }

    createNewGame(ws, player) {
        let newGame = new Game(this.games.length + 1, player)
        this.games.push(newGame)

        this.sendResourceMessage('displayNewGame', newGame, ws)
    }

    getJoinableGame(ws) {
        this.sendResourceMessage('displayJoinableGame', this.games.filter((game) => game.state == Game.STATE.CREATED), ws)
    }

    joinGame(ws, player, gameId) {
        let gameToJoin = this.games.find((game) => game.id === gameId)
        gameToJoin.players.push(player)
        this.sendResourceMessage(gameToJoin, 'joinningGame', ws)
    }

    updateBoardRequest(ws, gameId, playerId ,row, col) {
        let game = this.games.find(game => game.id == gameId)

        if (!game) {
            console.error('No game found for id : ' + gameId)
            return
        }

        console.log("Game found", game)

        if (game.play(row, col, playerId)) {
            let icon = game.getPlayerIcon(playerId)
            this.sendResourceMessage('updateBoard', { row, col, icon }, ws)
        } else {
            this.sendResourceMessage('invalidMove', ws)
        }
    }
}