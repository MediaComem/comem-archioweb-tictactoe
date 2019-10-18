/**
 * Will init a two dim array representing a board with the value
 * passed in param
 * @param {*} x number of row
 * @param {*} y number of col
 * @param {*} value  value to init the array
 */
const initABoard = (x, y, value = -1) => {
    let board = Array(x)

    for (i = 0; i < x; i++) {
        board[i] = Array(y)
        for (j = 0; j < y; j++) {
            board[i][j] = value
        }
    }

    return board
}


module.exports = class {
    static STATE = { "CREATED": "CREATED", "RUNNING": "RUNNING", "STOPPED": "STOPPED", "CLOSED":"CLOSED" }
    static MAX_PLAYER = 2
    static PLAYERS_ICON = {
        1: 'X',
        2: 'O'
    }

    static BOARD_ROW = 3
    static BOARD_COL = 3

    constructor(id, player) {
        this.id = id
        this.players = [player]
        this.state = this.constructor.STATE.CREATED

        this.playerTurn = Math.floor(Math.random() * this.constructor.MAX_PLAYER) + 1
        this.board = initABoard(this.constructor.BOARD_ROW, this.constructor.BOARD_COL, -1)
    }

    getPlayerIcon(playerId) {
        return this.constructor.PLAYERS_ICON[this.players.findIndex(player => player.id === playerId) + 1]
    }

    isCellEmpty(row, col) {
        return this.board[row][col] === -1
    }

    canPlay(playerId) {
        return this.players[this.playerTurn - 1].id === playerId
    }

    hasWin(playerId) {
        let numPlayer = this.players.findIndex(player => player.id === playerId) + 1

        const checkCol = () => {
            let winIndex = 0

            for (let i = 0; i < this.constructor.BOARD_COL; i++) {
                winIndex = 0
                for (let j = 0; j < this.constructor.BOARD_ROW; j++) {
                    if (this.board[i][j] === numPlayer) {
                        winIndex++
                    }
                }

                if (winIndex === 3) {
                    return true
                }
            }

            return false
        }

        const checkRow = () => {

            let winIndex = 0

            for (let i = 0; i < this.constructor.BOARD_ROW; i++) {
                winIndex = 0
                for (let j = 0; j < this.constructor.BOARD_COL; j++) {
                    if (this.board[i][j] === numPlayer) {
                        winIndex++
                    }
                }
                
                if (winIndex === 3) {
                    return true
                }
            }

            return false

        }

        const checkDiag = () => {
            let winIndex = 0

            for (let i = 0, j = 0; i < this.constructor.BOARD_ROW && j < this.constructor.BOARD_COL; i++ , j++) {
                if (this.board[i][j] === numPlayer) {
                    winIndex++
                }
            }

            if (winIndex === 3) {
                return true
            }

            winIndex = 0

            for (let i = 0, j = this.constructor.BOARD_COL - 1; i < this.constructor.BOARD_ROW && j >= 0; i++ , j--) {
                if (this.board[i][j] === numPlayer) {
                    winIndex++
                }
            }

            if (winIndex === 3) {
                return true
            }

            return false
        }

        return checkCol() | checkRow() | checkDiag()

    }

    addNewPlayer(player) {
        if (this.players.length >= this.MAX_PLAYER) {
            return false
        }

        this.players.push(player)

        return true
    }

    play(row, col, playerId) {
        if (this.state !== this.constructor.STATE.RUNNING) {
            return false
        }

        if (!this.isCellEmpty(row, col) || !this.canPlay(playerId)) {
            return false
        }

        this.board[row][col] = this.players[this.playerTurn - 1].id

        this.playerTurn = this.playerTurn >= this.constructor.MAX_PLAYER ? 1 : this.playerTurn + 1

        return true
    }
}