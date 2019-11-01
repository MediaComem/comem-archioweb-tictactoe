const Game = require('../../class/game.class');

module.exports = class {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  createNewGame(playerId) {

    const player = this.gameManager.findPlayerById(playerId);
    const newGame = new Game(this.gameManager.games.length + 1, player);
    this.gameManager.addGame(newGame);

    return newGame;
  }

  getJoinableGames() {
    return this.gameManager.getAllCreatedGames();
  }

  play(gameId, playerId, col, row) {
    const game = this.gameManager.findGameById(gameId);

    if (!game) {
      return 'invalidGame';
    } else if (!game.play(col, row, playerId)) {
      return 'invalidMove';
    }

    const icon = game.getPlayerIcon(playerId);

    const hasWin = game.hasWin(row, col, playerId);
    const draw = game.checkDraw();

    if (hasWin || draw) {
      game.state = Game.STATE.STOPPED;
    }

    return {
      players: game.players,
      playerIcon: icon,
      hasWin: hasWin,
      draw: draw
    };
  }

  joinGame(gameId, playerId) {

    const game = this.gameManager.findGameById(gameId);
    const player = this.gameManager.findPlayerById(playerId);
    if (!game.addNewPlayer(player)) {
      return 'invalidGame';
    }

    game.state = Game.STATE.RUNNING;

    return {
      game,
      player
    };
  }

  exitGame(gameId, playerId) {
    const game = this.gameManager.findGameById(gameId);

    game.state = Game.STATE.CLOSED;

    return { game: game, idPlayerSendingRequest: playerId };
  }
};
