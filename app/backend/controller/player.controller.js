const Player = require('../../class/player.class');

module.exports = class {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  createPlayer() {
    const newPlayer = new Player(this.gameManager.players.length + 1, 'No Name');
    this.gameManager.addPlayer(newPlayer);

    return newPlayer;
  }
};
