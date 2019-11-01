const uuidv4 = require('uuid/v4');

const Player = require('../../class/player.class');

module.exports = class {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  createPlayer() {
    const newPlayer = new Player(uuidv4(), 'No Name');
    this.gameManager.addPlayer(newPlayer);

    return newPlayer;
  }
};
