const Game = require('../../class/game.class')
const Controller = require('../../class/ws-controller.class')

module.exports = class extends Controller {
    constructor(gameManager) {
        super('game')
        this.gameManager = gameManager
    }

    createNewGame(ws, player) {
        let newGame = new Game(this.gameManager.games.length + 1, player)
        this.gameManager.addGame(newGame)

        this.gameManager.players.forEach(p => {
            if(p.id !== player.id){
                this.sendResourceMessage('newJoinableGame',newGame, p.websocket)
            }
        })
        this.sendResourceMessage('displayNewGame', newGame, ws)
    }

    getJoinableGame(ws) {
        this.sendResourceMessage('displayJoinableGame', this.gameManager.getAllCreatedGames(), ws)
    }

    joinGame(ws, player, gameId) {
        let gameToJoin = this.gameManager.findGameById(gameId)
        gameToJoin.players.push(player)
        this.sendResourceMessage(gameToJoin, 'joinningGame', ws)
    }

    updateBoardRequest(ws, gameId, playerId ,row, col) {
        let game = this.gameManager.findGameById(gameId)

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