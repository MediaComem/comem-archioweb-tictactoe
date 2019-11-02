const Player = require('../../class/player.class');

/**
 * A controller to manage multiple tic-tac-toe players.
 */
class PlayerController {

  /**
   * Constructs a new controller for the specified players and games.
   * @param {GameManager} gameManager - The manager of registered players and games.
   */
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  /**
   * Creates and returns a new player.
   * @returns {Player} A player.
   */
  createPlayer() {

    const players = this.gameManager.players;
    const newPlayer = new Player(players.length === 0 ? 1 : players[players.length - 1].id + 1);
    this.gameManager.addPlayer(newPlayer);

    return newPlayer;
  }
}

module.exports = PlayerController;
