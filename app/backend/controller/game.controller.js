const GameError = require('../../class/game-error.class');
const Game = require('../../class/game.class');

/**
 * A controller to manage multiple tic-tac-toe games.
 */
class GameController {

  /**
   * Constructs a new controller for the specified players and games.
   * @param {GameManager} gameManager - The manager of registered players and games.
   */
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  /**
   * Creates and stores a new game started by the specified player.
   * @param {string} playerId - The player's ID.
   * @returns {Game} The newly created game.
   * @throws {GameError} If the player is not found: error code <code>tictactoe.playerNotFound</code>.
   */
  createNewGame(playerId) {

    const player = this.gameManager.findPlayerById(playerId);
    if (!player) {
      throw new GameError('tictactoe.playerNotFound', `Player ${playerId} not found`);
    }

    const newGame = new Game(this.gameManager.games.length + 1, player);
    this.gameManager.addGame(newGame);

    return newGame;
  }

  /**
   * Returns the list of games that have not yet started and can still be joined.
   * @returns {Game[]} A list of games, which may be empty.
   */
  getJoinableGames() {
    return this.gameManager.getCreatedGames();
  }

  /**
   * Makes a player join a game, provided the game has not yet started.
   * @param {string} gameId - The game's ID.
   * @param {string} playerId - The player's ID.
   * @returns {GameController~JoinGameResult} The game and player.
   * @throws {GameError} If the game is not found: error code <code>tictactoe.gameNotFound</code>.
   * @throws {GameError} If the player is not found: error code <code>tictactoe.playerNotFound</code>.
   * @throws {GameError} If the game is full: error code <code>tictactoe.gameFull</code>.
   */
  joinGame(gameId, playerId) {

    const game = this.gameManager.findGameById(gameId);
    const player = this.gameManager.findPlayerById(playerId);
    if (!game) {
      throw new GameError('tictactoe.gameNotFound', `Game ${gameId} not found`);
    } else if (!player) {
      throw new GameError('tictactoe.playerNotFound', `Player ${playerId} not found`);
    } else if (!game.addNewPlayer(player)) {
      throw new GameError('tictactoe.gameFull', 'Game is full');
    }

    game.state = Game.STATE.RUNNING;

    return {
      game,
      player
    };
  }

  /**
   * Makes a player play a move in a game.
   * @param {string} gameId - The game's ID.
   * @param {string} playerId - The player's ID.
   * @param {number} col - The column's index of the cell in which to play.
   * @param {number} row - The row's index of the cell in which to play.
   * @returns {GameController~PlayResult} An object representing the state of the game after the move is played.
   * @throws {GameError} If the game is not found: error code <code>tictactoe.gameNotFound</code>.
   * @throws {GameError} If the move is invalid or the player is not in the game: error code <code>tictactoe.invalidMove</code>.
   */
  play(gameId, playerId, col, row) {

    const game = this.gameManager.findGameById(gameId);
    if (!game) {
      throw new GameError('tictactoe.gameNotFound', `Game ${gameId} not found`);
    } else if (!game.play(col, row, playerId)) {
      throw new GameError('tictactoe.invalidMove', 'Invalid move');
    }

    const icon = game.getPlayerIcon(playerId);
    const win = game.checkWin(col, row, playerId);
    const draw = game.checkDraw();

    if (win || draw) {
      game.state = Game.STATE.STOPPED;
    }

    return {
      game,
      win,
      draw,
      icon
    };
  }

  /**
   * Makes a player leave a game.
   * @param {string} gameId - The game's ID.
   * @param {string} playerId - The player's ID.
   * @returns {GameController~LeaveGameResult} The game and player.
   * @throws {GameError} If the game is not found: error code <code>tictactoe.gameNotFound</code>.
   * @throws {GameError} If the player is not in the game: error code <code>tictactoe.playerNotInGame</code>.
   */
  leaveGame(gameId, playerId) {

    const game = this.gameManager.findGameById(gameId);
    if (!game) {
      throw new GameError('tictactoe.gameNotFound', `Game ${gameId} not found`);
    }

    const player = game.getPlayer(playerId);
    if (!player) {
      throw new GameError('tictactoe.playerNotInGame', `Player ${playerId} is not in game ${gameId}`);
    }

    game.state = Game.STATE.CLOSED;

    return {
      game,
      player
    };
  }
}

/**
 * The result of a player joining a game.
 * @typedef {Object} GameController~JoinGameResult
 * @property {Game} game - The game that was joined.
 * @property {Player} player - The player who joined.
 */

/**
 * The result of a player leaving a game.
 * @typedef {Object} GameController~LeaveGameResult
 * @property {Game} game - The game that was left.
 * @property {Player} player - The player who left.
 */

/**
 * The result of a player playing a move in a game.
 * @typedef {Object} GameController~PlayResult
 * @property {Game} game - The game in which the move was made.
 * @property {boolean} win - Whether the game is a win.
 * @property {boolean} draw - Whether the game is a draw.
 * @property {string} icon - The icon (<code>X</code> or <code>O</code>) of the player who made the move.
 */

module.exports = GameController;
