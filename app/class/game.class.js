/**
 * A game of tic-tac-toe.
 */
class Game {
    static STATE = { CREATED: 'CREATED', RUNNING: 'RUNNING', STOPPED: 'STOPPED', CLOSED: 'CLOSED' }

    static EMPTY_CELL = 0

    static MAX_PLAYER = 2

    static PLAYERS_ICON = {
      1: 'X',
      2: 'O'
    }

    /**
     * Constructs a new game started by a player. Another player can then join it.
     * @param {string} id - A unique identifier for the game.
     * @param {Player} player - The player who started the game.
     * @param {number} boardSize - The number of columns and rows.
     */
    constructor(id, player, boardSize = 3) {
      this.id = id;
      this.players = [ player ];
      this.state = this.constructor.STATE.CREATED;
      this.boardSize = boardSize;


      this.playerTurn = Math.floor(Math.random() * this.constructor.MAX_PLAYER) + 1;
      this.board = initializeBoard(this.boardSize, this.boardSize, this.constructor.EMPTY_CELL);
    }

    /**
     * Returns the specified player from this game.
     * @param {string} playerId - The player's ID.
     * @returns {Player|undefined} The player if he or she is in this game, undefined otherwise.
     */
    getPlayer(playerId) {
      return this.players.find(player => player.id === playerId);
    }

    /**
     * Returns the icon (<code>X</code> or <code>O</code>) for the player in
     * this game with the specified ID.
     * @param {string} playerId - The player's ID.
     * @returns {string|undefined} The icon, or undefined if the player is not
     *   in this game.
     */
    getPlayerIcon(playerId) {
      return this.constructor.PLAYERS_ICON[this.getPlayerNum(playerId)];
    }

    /**
     * Returns the icon (<code>X</code> or <code>O</code>) for the current
     * player in this game.
     * @returns {string} <code>X</code> or <code>O</code>.
     */
    getPlayerTurnIcon() {
      return this.constructor.PLAYERS_ICON[this.playerTurn];
    }

    /**
     * Indicates whether the specified cell is empty in this game's board.
     * @param {number} col - The column's index.
     * @param {number} row - The row's index.
     * @returns {boolean} True if nobody has played in the specified cell, false
     *   otherwise or if the cell is outside the board's bounds.
     */
    isCellEmpty(col, row) {
      if (col < 0 || col >= this.boardSize || row < 0 || row >= this.boardSize) {
        return false;
      }

      return this.board[row][col] === this.constructor.EMPTY_CELL;
    }

    /**
     * Indicates whether it's the specified player's turn to play.
     * @param {string} playerId - The player's ID.
     * @returns {boolean} True if it's the player's turn.
     */
    canPlay(playerId) {
      return this.players[this.playerTurn - 1].id === playerId;
    }

    /**
     * Returns the number of the specified player in this game. The first player
     * is 1, the second player is 2.
     * @param {string} playerId - The player's ID.
     * @returns {number} The player's number, or 0 if no player with that ID has
     *   joined this game.
     */
    getPlayerNum(playerId) {
      return this.players.findIndex(player => player.id === playerId) + 1;
    }

    /**
     * Checks whether this game is a win.
     * @param {number} col - The index of the last move's column.
     * @param {number} row - The index of the last move's row.
     * @param {string} playerId - The player's ID.
     * @returns {boolean} True if this game is a win.
     */
    checkWin(col, row, playerId) {
      return this._checkColWin(col, playerId) ||
            this._checkRowWin(row, playerId) ||
            this._checkDiagWin(row, col, playerId) ||
            this._checkAntiDiagWin(row, col, playerId);
    }

    /**
     * Checks whether this game is a draw.
     * @returns {boolean} True if this game is a draw.
     */
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

    /**
     * Adds a player to this game, provided the game is not full.
     * @param {Player} player - The player to add.
     * @returns {boolean} True if the player was added, false if the game is full.
     */
    addNewPlayer(player) {
      if (this.players.length >= this.MAX_PLAYER) {
        return false;
      }

      this.players.push(player);
      return true;
    }

    /**
     * Plays a move in this game (i.e. place a <code>X</code> or <code>O</code>
     * in a cell).
     * @param {number} col - The column's index.
     * @param {number} row - The row's index.
     * @param {string} playerId - The player's ID.
     * @returns {boolean} True if the move was played, false if the game was not
     *   running, or the cell was not empty, or it was not the specified
     *   player's turn.
     */
    play(col, row, playerId) {
      if (this.state !== this.constructor.STATE.RUNNING || !this.isCellEmpty(col, row) || !this.canPlay(playerId)) {
        return false;
      }

      this.board[row][col] = this.players[this.playerTurn - 1].id;
      this.playerTurn = this.playerTurn >= this.constructor.MAX_PLAYER ? 1 : this.playerTurn + 1;

      return true;
    }

    _checkColWin(col, playerId) {
      for (let i = 0; i < this.boardSize; i++) {
        if (this.board[i][col] !== playerId) {
          return false;
        }
      }

      return true;
    }

    _checkRowWin(row, playerId) {
      for (let i = 0; i < this.boardSize; i++) {
        if (this.board[row][i] !== playerId) {
          return false;
        }
      }

      return true;
    }

    _checkDiagWin(row, col, playerId) {
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

    _checkAntiDiagWin(row, col, playerId) {
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
}

/**
 * Creates and returns a two-dimensional array representing a rectangular board
 * with the specified dimensions.
 *
 * @private
 * @param {number} rows - The number of rows.
 * @param {number} cols - The number of columns.
 * @param {*} value - The initial value of each cell in the board.
 * @returns {Array<Array<*>>} An initialized board.
 */
function initializeBoard(rows, cols, value) {
  const board = new Array(rows);

  for (let i = 0; i < rows; i++) {
    board[i] = new Array(cols);
    for (let j = 0; j < cols; j++) {
      board[i][j] = value;
    }
  }

  return board;
}

module.exports = Game;
