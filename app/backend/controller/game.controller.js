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
            if (p.id !== player.id) {
                this.sendResourceMessage('newJoinableGame', newGame, p.websocket)
            }
        })
        this.sendResourceMessage('displayNewGame', newGame, ws)
    }

    getJoinableGame(ws) {
        this.sendResourceMessage('displayJoinableGame', this.gameManager.getAllCreatedGames(), ws)
    }

    updateBoardRequest(ws, gameId, playerId, row, col) {
        let game = this.gameManager.findGameById(gameId)

        if (!game) {
            console.error('No game found for id : ' + gameId)
            return
        }

        if (game.play(row, col, playerId)) {
            let icon = game.getPlayerIcon(playerId)

            let hasWin = game.hasWin(row, col, playerId)
            let draw = game.checkDraw()

            if (hasWin || draw) {
                game.state = Game.STATE.STOPPED
            }

            game.players.forEach((player) => {
                let playerWS = this.gameManager.findPlayerById(player.id).websocket
                this.sendResourceMessage('updateBoard', [row, col, icon], playerWS)
                if (hasWin) {
                    this.sendResourceMessage('winMove', [playerId, icon], playerWS)
                } else if (draw) {
                    this.sendResourceMessage('drawMove', [], playerWS)
                }
            })

        } else {
            this.sendResourceMessage('invalidMove', [], ws)
        }
    }

    requestJoinGame(ws, gameId, playerId) {
        let game = this.gameManager.findGameById(gameId)
        let player = this.gameManager.findPlayerById(playerId)

        if (game.addNewPlayer(player)) {
            game.state = Game.STATE.RUNNING

            this.sendResourceMessage('displayNewGame', [game], ws)
        } else {
            this.sendResourceMessage('invalidGame', [], ws)
        }

    }
}