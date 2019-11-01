/**
 * Will init a two dim array representing a board with the value passed in
 * param.
 *
 * @param {*} x number of row
 * @param {*} y number of col
 * @param {*} value  value to init the array
 * @returns {Object} An initialized board.
 */
const initABoard = (x, y, value) => {
  const board = Array(x);

  for (let i = 0; i < x; i++) {
    board[i] = Array(y);
    for (let j = 0; j < y; j++) {
      board[i][j] = value;
    }
  }

  return board;
};


module.exports = class {
    static STATE = { CREATED: 'CREATED', RUNNING: 'RUNNING', STOPPED: 'STOPPED', CLOSED: 'CLOSED' }

    static EMPTY_CELL = 0

    static MAX_PLAYER = 2

    static PLAYERS_ICON = {
      1: 'X',
      2: 'O'
    }

    constructor(id, player, boardSize = 3) {
      this.id = id;
      this.players = [ player ];
      this.state = this.constructor.STATE.CREATED;
      this.boardSize = boardSize;


      this.playerTurn = Math.floor(Math.random() * this.constructor.MAX_PLAYER) + 1;
      this.board = initABoard(this.boardSize, this.boardSize, this.constructor.EMPTY_CELL);
    }

    getPlayerIcon(playerId) {
      return this.constructor.PLAYERS_ICON[this.getPlayerNum(playerId)];
    }

    getPlayerTurnIcon() {
      return this.constructor.PLAYERS_ICON[this.playerTurn];
    }

    isCellEmpty(col, row) {
      return this.board[row][col] === this.constructor.EMPTY_CELL;
    }

    canPlay(playerId) {
      return this.players[this.playerTurn - 1].id === playerId;
    }

    getPlayerNum(playerId) {
      return this.players.findIndex(player => player.id === playerId) + 1;
    }

    checkColWin(col, playerId) {
      for (let i = 0; i < this.boardSize; i++) {
        if (this.board[i][col] !== playerId) {
          return false;
        }
      }

      return true;
    }

    checkRowWin(row, playerId) {
      for (let i = 0; i < this.boardSize; i++) {
        if (this.board[row][i] !== playerId) {
          return false;
        }
      }

      return true;
    }

    checkDiagWin(row, col, playerId) {
      if (row !== col) {
        return false;
      }

      for (let i = 0; i < this.boardSize; i++) {
        if (this.board[i][i] !== playerId) {
          return false;
        }
      }

      return true;
    }

    checkAntiDiagWin(row, col, playerId) {
      if (row + col !== this.boardSize - 1) {
        return false;
      }

      for (let i = 0; i < this.boardSize; i++) {
        if (this.board[i][this.boardSize - 1 - i] !== playerId) {
          return false;
        }
      }

      return true;
    }

    hasWin(row, col, playerId) {
      return this.checkColWin(col, playerId) ||
            this.checkRowWin(row, playerId) ||
            this.checkDiagWin(row, col, playerId) ||
            this.checkAntiDiagWin(row, col, playerId);
    }

    checkDraw() {
      for (let i = 0; i < this.boardSize; i++) {
        for (let j = 0; j < this.boardSize; j++) {
          if (this.board[i][j] === this.constructor.EMPTY_CELL) {
            return false;
          }
        }
      }

      return true;
    }

    addNewPlayer(player) {
      if (this.players.length >= this.MAX_PLAYER) {
        return false;
      }

      this.players.push(player);

      return true;
    }

    play(col, row, playerId) {
      if (this.state !== this.constructor.STATE.RUNNING) {
        return false;
      }

      if (!this.isCellEmpty(col, row) || !this.canPlay(playerId)) {
        return false;
      }

      this.board[row][col] = this.players[this.playerTurn - 1].id;

      this.playerTurn = this.playerTurn >= this.constructor.MAX_PLAYER ? 1 : this.playerTurn + 1;

      return true;
    }
};
