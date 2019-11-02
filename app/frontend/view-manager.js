import $ from 'jquery';

import Game from '../class/game.class';

/**
 * Manager of the frontend's DOM events & manipulation.
 */
class ViewManager {

  /**
   * Constructs a new view manager.
   */
  constructor() {
    this.events = $({});

    this.SHOWGAME_CONTAINER = $('.showgame-container');
    this.CREATEGAME_CONTAINER = $('.creategame-container');
    this.INFOPLAYER_CONTAINER = $('.info-player');
    this.BOARD_GRID = $('.board');
    this.GAMES_CONTAINER = $('.games');
    this.TOAST = $('#alertMsg');

    this.TMP_BOARD_BTN = $('.tmp.board-btn', this.CREATEGAME_CONTAINER).remove().removeClass('tmp').clone();
    this.TMP_JOINABLE_GAME = $('.tmp.joinable-game').removeClass('tmp').remove().clone();

    this.BTN_CREATE_NEWGAME = $('#createNewGame');
    this.BTN_LEAVE_GAME = $('#leave-game');

    this.INPT_SEARCH_GAME = $('#searchbyplayer');

    this.CREATEGAME_CONTAINER.hide();
    this.BTN_CREATE_NEWGAME.attr('disabled');

    this._initializeEvents();
  }

  /**
   * Registers an event handler.
   *
   * <ul>
   *   <li><code>createGame()</code> - The user clicked the Create Game button.</li>
   *   <li><code>joinGame(gameId)</code> - The user clicked one of the displayed games' Join Game button.</li>
   *   <li><code>play(col, row)</code> - The user clicked one of the board's cells in the current game.</li>
   *   <li><code>leaveGame()</code> - The user clicked the Leave Game button.</li>
   * </ul>
   * @param {string} eventName - The event name.
   * @param {Function} handler - A function to call when the event occurs.
   */
  on(eventName, handler) {
    this.events.on(eventName, (event, ...args) => handler(...args));
  }

  /**
   * Displays a toast message visible to the end user.
   * @param {string} message - The message to display.
   */
  displayToast(message) {
    $('.toast-header-text', this.TOAST).text(message);
    this.TOAST.toast('show');
  }

  /**
   * Displays the specified game so the current player can play.
   * @param {Game} game - The game to display.
   * @param {Player} player - The player.
   */
  displayGame(game, player) {
    const gameInstance = new Game();
    Object.assign(gameInstance, game);

    const playerIcon = gameInstance.getPlayerIcon(player.id);
    const playerTurnIcon = gameInstance.getPlayerTurnIcon();

    gameInstance.board.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        const boardBtn = this.TMP_BOARD_BTN.clone();

        boardBtn.addClass('EMPTY');
        boardBtn.on('click', () => this.events.trigger('play', [ colIndex, rowIndex ]));

        this.BOARD_GRID.append(boardBtn);
      });
    });

    $('.info-player-icon', this.INFOPLAYER_CONTAINER).addClass(playerIcon);
    $('.info-player-icon', this.INFOPLAYER_CONTAINER).text(playerIcon);

    this.BOARD_GRID.addClass(`${playerTurnIcon}-turn`);

    this.SHOWGAME_CONTAINER.hide();
    this.CREATEGAME_CONTAINER.show();
  }

  /**
   * Displays a player's icon (<code>X</code> or <code>O</code>) in one of the board's cells.
   * @param {number} col - The column's index.
   * @param {number} row - The row's index.
   * @param {string} icon - The player's icon (<code>X</code> or <code>O</code>).
   */
  updateBoard(col, row, icon) {
    const boardBtn = this.BOARD_GRID.children().eq(row * 3 + col);
    boardBtn.text(icon);
    boardBtn.removeClass('EMPTY');
    boardBtn.addClass(icon.toUpperCase());

    this.BOARD_GRID.removeClass(`${icon.toUpperCase()}-turn`);
    this.BOARD_GRID.addClass(`${icon.toUpperCase() === 'O' ? 'X' : 'O'}-turn`);
  }

  /**
   * Adds a game to the displayed list of joinable games.
   * @param {Game} game - The game to add.
   */
  addJoinableGame(game) {
    const joinableGame = this.TMP_JOINABLE_GAME.clone();

    joinableGame.attr('data-playerid', String(game.players[0].id));
    joinableGame.attr('data-gameid', String(game.id));

    $('.playerid', joinableGame).text('');
    $('.playername', joinableGame).text(`Game by player ${game.players[0].id}`);

    $('.join-btn', joinableGame).on('click', () => this.events.trigger('joinGame', [ game.id ]));

    $('.games', this.SHOWGAME_CONTAINER).append(joinableGame);
  }

  /**
   * Removes a game from the displayed list of joinable games.
   * @param {Game} gameId - The ID of the game to remove.
   */
  removeJoinableGame(gameId) {
    $('.games', this.SHOWGAME_CONTAINER).children().each((i, ele) => {
      if ($(ele).attr('data-gameid') === String(gameId)) {
        $(ele).fadeOut('fast').remove();
      }
    });
  }

  /**
   * Leaves the current game, going back to the list of joinable games.
   */
  leaveGame() {
    this.SHOWGAME_CONTAINER.show();
    this.CREATEGAME_CONTAINER.hide();

    this.BOARD_GRID.attr('class', 'board');
    this.BOARD_GRID.children().each((i, ele) => $(ele).remove());

    $('.info-player-icon', this.INFOPLAYER_CONTAINER).attr('class', 'info-player-icon');
    $('.info-player-icon', this.INFOPLAYER_CONTAINER).text('');
  }

  _initializeEvents() {
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

    this.BTN_CREATE_NEWGAME.click(() => this.events.trigger('createGame'));
    this.BTN_LEAVE_GAME.click(() => this.events.trigger('leaveGame'));
  }
}

export default ViewManager;
