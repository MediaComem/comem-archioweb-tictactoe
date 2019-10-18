const Controller = require('../../class/ws-controller.class')
const LCS_MANAGER = require('../localstorage-manager')


module.exports = class extends Controller {
    constructor(viewManger) {
        super('game')
        this.viewManger = viewManger
    }

    createGame(ws) {
        let player = LCS_MANAGER.load('player')
        if (!player) {
            console.error('No player defined')
            return
        }

        this.sendResourceMessage('createNewGame', player, ws)
    }

    displayNewGame(ws, game) {
        LCS_MANAGER.save('game', game)

        this.viewManger.displayNewGame(game.board)

    }

    updateBoardRequest(ws, row, col) {
        let game = LCS_MANAGER.load('game')
        let player = LCS_MANAGER.load('player')

        if (!game) {
            console.error('player not in any game')
            return
        }

        this.sendResourceMessage('updateBoardRequest', [game.id, player.id ,row, col], ws)
    }

    updateBoard(ws, row, col, icon) {
        this.viewManger.updateBoard(row,col,icon)
    }

    invalidMove(ws, pos) {
        alert("you're move is invalid")
    }

    newJoinableGame(ws, newGame) {
        this.viewManger.addNewJoinableGame(newGame)
    }

    requestJoinGame(ws, gameId) {
        let player = LCS_MANAGER.load('player')
        this.sendResourceMessage('requestJoinGame', [gameId, player.id], ws)
    }

    winMove(ws, playerId, icon) {
        alert(`${icon} win.`)
    }
}