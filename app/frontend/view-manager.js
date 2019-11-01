const $ = require('jquery');

const Game = require('../class/game.class');

module.exports = class {
  constructor() {
    this.SHOWGAME_CONTAINER = $('.showgame-container');
    this.CREATEGAME_CONTAINER = $('.creategame-container');
    this.INFOPLAYER_CONTAINER = $('.info-player');
    this.BOARD_GRID = $('.board');
    this.GAMES_CONTAINER = $('.games');
    this.TOAST = $('#alertMsg');

    this.TMP_BOARD_BTN = $('.tmp.board-btn', this.CREATEGAME_CONTAINER).remove().removeClass('tmp').clone();
    this.TMP_JOINABLE_GAME = $('.tmp.joinable-game').removeClass('tmp').remove().clone();

    this.BTN_CREATE_NEWGAME = $('#createNewGame');
    this.BTN_EXIT_GAME = $('#exit-game');

    this.INPT_SEARCH_GAME = $('#searchbyplayer');

    this.CREATEGAME_CONTAINER.hide();
    this.BTN_CREATE_NEWGAME.attr('disabled');
  }

  displayToast(msg) {
    $('.toast-header-text', this.TOAST).text(msg);
    this.TOAST.toast('show');
  }

  displayGame(player, game, fncUpdateBoardRequest) {
    const gameInstance = new Game();
    Object.assign(gameInstance, game);

    const playerIcon = gameInstance.getPlayerIcon(player.id);
    const playerTurnIcon = gameInstance.getPlayerTurnIcon();

    gameInstance.board.forEach((row, i) => {
      row.forEach((col, j) => {
        const boardBtn = this.TMP_BOARD_BTN.clone();

        boardBtn.addClass('EMPTY');

        boardBtn.on('click', () => {
          fncUpdateBoardRequest(j, i);
        });

        this.BOARD_GRID.append(boardBtn);
      });
    });

    $('.info-player-icon', this.INFOPLAYER_CONTAINER).addClass(playerIcon);
    $('.info-player-icon', this.INFOPLAYER_CONTAINER).text(playerIcon);

    this.BOARD_GRID.addClass(`${playerTurnIcon}-turn`);

    this.SHOWGAME_CONTAINER.hide();
    this.CREATEGAME_CONTAINER.show();
  }

  updateBoard(col, row, icon) {
    const boardBtn = this.BOARD_GRID.children().eq(row * 3 + col);
    boardBtn.text(icon);
    boardBtn.removeClass('EMPTY');
    boardBtn.addClass(icon.toUpperCase());

    this.BOARD_GRID.removeClass(`${icon.toUpperCase()}-turn`);
    this.BOARD_GRID.addClass(`${icon.toUpperCase() === 'O' ? 'X' : 'O'}-turn`);
  }

  addGame(player, game, fncRequestJoinGame) {
    const joinableGame = this.TMP_JOINABLE_GAME.clone();

    joinableGame.attr('data-playerid', String(game.players[0].id));
    joinableGame.attr('data-gameid', String(game.id));

    $('.playerid', joinableGame).text('');
    $('.playername', joinableGame).text(`Game by player ${game.players[0].id}`);

    $('.join-btn', joinableGame).on('click', () => {
      fncRequestJoinGame(game.id, player.id);
    });

    $('.games', this.SHOWGAME_CONTAINER).append(joinableGame);
  }

  removeGame(gameId) {
    $('.games', this.SHOWGAME_CONTAINER).children().each((i, ele) => {
      if ($(ele).attr('data-gameid') === String(gameId)) {
        $(ele).fadeOut('fast').remove();
      }
    });
  }

  exitGame() {
    this.SHOWGAME_CONTAINER.show();
    this.CREATEGAME_CONTAINER.hide();

    this.BOARD_GRID.attr('class', 'board');
    this.BOARD_GRID.children().each((i, ele) => $(ele).remove());

    $('.info-player-icon', this.INFOPLAYER_CONTAINER).attr('class', 'info-player-icon');
    $('.info-player-icon', this.INFOPLAYER_CONTAINER).text('');
  }

  initEventManager(fncCreateNewGame, fncExitGameRequest) {
    this.INPT_SEARCH_GAME.keyup(() => {
      const inputText = this.INPT_SEARCH_GAME.val();

      this.GAMES_CONTAINER.children().each((i, ele) => {
        console.log(ele.innerHTML);
        if ($(ele).attr('data-playerid').includes(inputText) || inputText === '') {
          $(ele).fadeIn('slow');
        } else {
          $(ele).fadeOut('slow');
        }
      });
    });

    this.BTN_CREATE_NEWGAME.click(() => {
      fncCreateNewGame();
    });

    this.BTN_EXIT_GAME.click(() => {
      fncExitGameRequest();
    });
  }
};
