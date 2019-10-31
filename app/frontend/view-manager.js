module.exports = class {
    constructor() {
        this.SHOWGAME_CONTAINER = $('.showgame-container')
        this.CREATEGAME_CONTAINER = $('.creategame-container')
        this.INFOPLAYER_CONTAINER = $(".info-player")
        this.BOARD_GRID = $('.board')
        this.GAMES_CONTAINER = $('.games')
        this.TOAST = $('#alertMsg')

        this.TMP_BOARD_BTN = $('.tmp.board-btn', this.CREATEGAME_CONTAINER).remove().removeClass('tmp').clone()
        this.TMP_JOINABLE_GAME = $('.tmp.joinable-game').removeClass('tmp').remove().clone()

        this.BTN_CREATE_NEWGAME = $('#createNewGame')
        this.BTN_EXIT_GAME = $('#exit-game')

        this.INPT_SEARCH_GAME = $('#searchbyplayer')


        this.CREATEGAME_CONTAINER.hide()
        this.BTN_CREATE_NEWGAME.attr('disabled')
    }

    displayToast(msg) {
        $('.toast-header-text', this.TOAST).text(msg)
        this.TOAST.toast('show')
    }

    displayNewGame(boardOfGameInstance,playerIcon, playerTurnIcon, fncUpdateBoardRequest) {
        boardOfGameInstance.forEach((row, i) => {
            row.forEach((col, j) => {
                let boardBtn = this.TMP_BOARD_BTN.clone()

                boardBtn.addClass('EMPTY')

                boardBtn.on('click', (evt) => {
                    fncUpdateBoardRequest(i, j)
                })

                this.BOARD_GRID.append(boardBtn)
            })
        })

        $('.info-player-icon', this.INFOPLAYER_CONTAINER).addClass(playerIcon)
        $('.info-player-icon', this.INFOPLAYER_CONTAINER).text(playerIcon)

        this.BOARD_GRID.addClass(`${playerTurnIcon}-turn`)

        this.SHOWGAME_CONTAINER.hide()
        this.CREATEGAME_CONTAINER.show()
    }

    updateBoard(row, col, icon) {
        let boardBtn = this.BOARD_GRID.children().eq(row * 3 + col)
        boardBtn.text(icon)
        boardBtn.removeClass('EMPTY')
        boardBtn.addClass(icon.toUpperCase())

        this.BOARD_GRID.removeClass(`${icon.toUpperCase()}-turn`)
        this.BOARD_GRID.addClass(`${icon.toUpperCase() === 'O' ? 'X' : 'O'}-turn`)
    }

    addNewJoinableGame(player, game, fncRequestJoinGame) {
        let joinableGame = this.TMP_JOINABLE_GAME.clone()

        joinableGame.attr('data-player', `${game.players[0].id} - ${game.players[0].username}`)
        joinableGame.attr('data-gameid', `${game.id}`)

        $('.playerid', joinableGame).text(`${game.players[0].id}`)
        $('.playername', joinableGame).text(game.players[0].username)

        $('.join-btn', joinableGame).on('click', (e) => {
            fncRequestJoinGame(game.id, player.id)
        })

        $(".games", this.SHOWGAME_CONTAINER).append(joinableGame)
    }

    removeJoinableGame(gameId) {
        $(".games", this.SHOWGAME_CONTAINER).children().each((i, ele) => {
            if ($(ele).attr('data-gameid') == gameId) {
                $(ele).fadeOut("fast").remove()
            }
        })
    }

    exitGame() {
        this.SHOWGAME_CONTAINER.show()
        this.CREATEGAME_CONTAINER.hide()

        this.BOARD_GRID.attr('class', 'board')
        this.BOARD_GRID.children().each((i, ele) => $(ele).remove())

        $('.info-player-icon', this.INFOPLAYER_CONTAINER).attr('class', 'info-player-icon')
        $('.info-player-icon', this.INFOPLAYER_CONTAINER).text('')
    }

    initEventManager(fncCreateNewGame, fncExitGameRequest) {
        this.INPT_SEARCH_GAME.keyup(() => {
            let inputText = INPT_SEARCH_GAME.val()

            this.GAMES_CONTAINER.children().each((i, ele) => {
                console.log(ele.innerHTML)
                if ($(ele).attr('data-player').includes(inputText) || inputText == '') {
                    $(ele).fadeIn('slow')
                } else {
                    $(ele).fadeOut('slow')
                }
            })
        })

        this.BTN_CREATE_NEWGAME.click(() => {
            fncCreateNewGame()
        })

        this.BTN_EXIT_GAME.click(() => {
            fncExitGameRequest()
        })
    }
}
