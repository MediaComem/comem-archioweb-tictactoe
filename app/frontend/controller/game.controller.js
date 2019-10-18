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

    displayNewGame(ws, res) {
        LCS_MANAGER.save('game', res)

        this.viewManger.displayNewGame(res.board, (evt) => {
            this.updateBoardRequest(ws, i, j)
        })

    }

    updateBoardRequest(ws, row, col) {
        let game = LCS_MANAGER.load('game')
        let player = LCS_MANAGER.load('player')

        if (!game) {
            console.error('player not in any game')
            return
        }

        this.sendResourceMessage('updateBoardRequest', [player.id, game.id, row, col], ws)
    }

    updateBoard(ws, res) {
        this.viewManger.updateBoard(res.row,res.col,res.icon)
    }

    invalidMove(ws, res) {
        alert("you're move is invalid")
    }

    newJoinableGame(ws, newGame) {
        this.viewManger.addNewJoinableGame(newGame)
    }
}