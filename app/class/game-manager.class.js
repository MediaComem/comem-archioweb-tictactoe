const Game = require('./game.class');

module.exports = class {
  constructor() {
    this.players = [];
    this.games = [];
  }

  addPlayer(player) {
    this.players.push(player);
  }

  addGame(game) {
    this.games.push(game);
  }

  getAllCreatedGames() {
    return this.games.filter(game => game.state === Game.STATE.CREATED);
  }

  findGameById(gameId) {
    return this.games.find(game => game.id === gameId);
  }

  findPlayerById(playerId) {
    return this.players.find(player => player.id === playerId);
  }
};
