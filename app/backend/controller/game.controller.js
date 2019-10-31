const Game = require('../../class/game.class')

module.exports = class {
    constructor(gameManager) {
        this.gameManager = gameManager
    }

    createNewGame(player) {
        let newGame = new Game(this.gameManager.games.length + 1, player)
        this.gameManager.addGame(newGame)

        return newGame
    }

    getJoinableGames() {
        return this.gameManager.getAllCreatedGames()
    }

    updateBoardRequest(gameId, playerId, row, col) {
        let game = this.gameManager.findGameById(gameId)

        if (!game) {
            console.error('No game found for id : ' + gameId)
            return 'noGameFound'
        }

        if (game.play(row, col, playerId)) {
            let icon = game.getPlayerIcon(playerId)

            let hasWin = game.hasWin(row, col, playerId)
            let draw = game.checkDraw()

            if (hasWin || draw) {
                game.state = Game.STATE.STOPPED
            }

            return {
                players: game.players,
                playerIcon: icon,
                hasWin: hasWin,
                draw: draw
            }

        } else {
            return 'invalidMove'
        }
    }

    requestJoinGame(gameId, playerId) {
        let game = this.gameManager.findGameById(gameId)
        let player = this.gameManager.findPlayerById(playerId)

        if (game.addNewPlayer(player)) {
            game.state = Game.STATE.RUNNING

            return { game: game, players: this.gameManager.players }
        } else {
            return 'invalidGame'
        }

    }

    exitGame(gameId, playerId) {
        let game = this.gameManager.findGameById(gameId)
        
        game.state = Game.STATE.CLOSED

        return { game: game, players: this.gameManager.players, idPlayerSendingRequest:playerId }
    }
}