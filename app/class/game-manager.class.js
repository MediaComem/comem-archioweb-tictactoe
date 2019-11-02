const Game = require('./game.class');

/**
 * Manager of the application state, holding all registered players and games.
 */
class GameManager {

  /**
   * Constructs a new manager with no games or players.
   */
  constructor() {
    this.games = [];
    this.players = [];
  }

  /**
   * Adds a player to the list of players.
   * @param {Player} player - The player to add.
   */
  addPlayer(player) {
    this.players.push(player);
  }

  /**
   * Adds a game to the list of games.
   * @param {Game} game - The game to add.
   */
  addGame(game) {
    this.games.push(game);
  }

  /**
   * Returns the games that have not yet started and can still be joined.
   * @returns {Game[]} A list of games, which may be empty.
   */
  getCreatedGames() {
    return this.games.filter(game => game.state === Game.STATE.CREATED);
  }

  /**
   * Returns the game with the specified ID if it exists.
   * @param {string} gameId - The game's ID.
   * @returns {Game|undefined} The corresponding game, or undefined.
   */
  findGameById(gameId) {
    return this.games.find(game => game.id === gameId);
  }

  /**
   * Returns the player with the specified ID if it exists.
   * @param {string} playerId - The player's ID.
   * @returns {Player|undefined} The corresponding player, or undefined.
   */
  findPlayerById(playerId) {
    return this.players.find(player => player.id === playerId);
  }
}

module.exports = GameManager;
