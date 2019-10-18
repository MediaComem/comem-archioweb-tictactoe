const Controller = require('../../class/ws-controller.class')
const LCS_MANAGER = require('../localstorage-manager')


module.exports = class extends Controller {
    constructor(boardContainer) {
        super('game')
        this.boardContainer = boardContainer
        this.TMP_BOARD_BTN = $('.tmp.board-btn', boardContainer).remove().removeClass('tmp').clone()
        this.BOARD_GRID = $(".board")
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

        res.board.forEach((row, i) => {
            row.forEach((col, j) => {
                let boardBtn = this.TMP_BOARD_BTN.clone()

                boardBtn.on('click', (evt) => {
                    this.updateBoardRequest(ws, i, j)
                })

                this.BOARD_GRID.append(boardBtn)
            })
        })

        this.boardContainer.show()
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
        this.BOARD_GRID.children().eq(res.row * 3 + res.col).text(res.icon)
    }

    invalidMove(ws, res) {
        alert("you're move is invalid")
    }
}