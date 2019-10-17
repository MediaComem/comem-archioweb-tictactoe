const Controller = require('../../class/controller.class')
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

        ws.send(this.sendMessage('createNewGame', player))
    }

    newGame(ws, res) {
        LCS_MANAGER.save('game', res)

        res.board.forEach((row, i) => {
            row.forEach((col, j) => {
                let boardBtn = this.TMP_BOARD_BTN.clone()
                this.BOARD_GRID.append(boardBtn)
                boardBtn.on('click', (evt) => {
                    this.updateBoard(ws, { row: i, col: j })
                })
            })
        })
    }

    updateBoardRequest(ws, col, row) {
        let game = LCS_MANAGER.load('game')

        if (!game) {
            console.error('player not in any game')
            return
        }

        ws.send(this.sendMessage('updateBoardRequest', [game.id, col, row]))
    }

    updateBoard(ws, res) {
        this.BOARD_GRID.eq(res.col * res.row).text("X")
    }

    invalidMove(ws, res) {
        alert("you're move is invalid")
    }
}