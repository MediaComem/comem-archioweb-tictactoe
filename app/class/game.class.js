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
    static STATE = { "CREATED": "CREATED", "RUNNING": "RUNNING", "STOPPED": "STOPPED" }

    constructor(id, player) {
        this.id = id
        this.players = [player]
        this.state = this.constructor.STATE.CREATED

        this.firstToPlay = Math.round(Math.random())
        this.playerTurn = this.firstToPlay
        this.board = initABoard(3, 3, -1)
    }

    isCellEmpty(row,col) {
        return this.board[row][col] === -1
    }
}