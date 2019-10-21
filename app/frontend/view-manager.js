const WSMessage = require('../class/ws-message')


module.exports = class {
    constructor(websocket, wsFrontendDispatcher) {
        this.websocket = websocket
        this.wsFrontendDispatcher = wsFrontendDispatcher

        this.initMainComponent()
        this.initTemplateManager()
        this.initEventManager()

    }

    initMainComponent() {
        this.showgameContainer = $('.showgame-container')

        this.creategameContainer = $('.creategame-container')

        this.BOARD_GRID = $('.board')

        this.btnCreateNewGame = $('#createNewGame')
        this.btnCreateNewGame.attr('disabled')

        this.infoPlayer = $(".info-player")

        this.creategameContainer.hide()
    }

    initTemplateManager() {
        this.TMP_BOARD_BTN = $('.tmp.board-btn', this.creategameContainer).remove().removeClass('tmp').clone()
        this.TMP_JOINABLE_GAME = $('.tmp.joinable-game').removeClass('tmp').remove().clone()
    }

    initEventManager() {
        $('#createNewGame').on('click', (evt) => {
            this.wsFrontendDispatcher.dispatchFromMsg(WSMessage.createMessageStructure(
                'game',
                'createGame',
                []
            ), this.websocket)
        })

        $('#exit-game').on('click', (evt) => {
            this.wsFrontendDispatcher.dispatchFromMsg(WSMessage.createMessageStructure(
                'game',
                'exitGameRequest',
                []
            ), this.websocket)
        })

        $('#searchbyplayer').on('keyup', (evt) => {
            let inputText = $('#searchbyplayer').val() ?  $('#searchbyplayer').val() : ''
            
            $('.games',this.showgameContainer).children().each((i, ele) => {
                if($(ele).attr('data-player').includes(inputText) || inputText == ''){
                    $(ele).fadeIn('slow')
                }else{
                    $(ele).fadeOut('slow')
                }
            })
        })
    }

    displayNewGame(board, playerIcon, playerTurnIcon) {
        board.forEach((row, i) => {
            row.forEach((col, j) => {
                let boardBtn = this.TMP_BOARD_BTN.clone()

                boardBtn.addClass('EMPTY')

                boardBtn.on('click', (evt) => {
                    this.wsFrontendDispatcher.dispatchFromMsg(WSMessage.createMessageStructure(
                        'game',
                        'updateBoardRequest',
                        [i, j]
                    ), this.websocket)
                })

                this.BOARD_GRID.append(boardBtn)
            })
        })

        $('.info-player-icon' ,this.infoPlayer).addClass(playerIcon)
        $('.info-player-icon' ,this.infoPlayer).text(playerIcon)
        
        this.BOARD_GRID.addClass(`${playerTurnIcon}-turn`)

        this.showgameContainer.hide()
        this.creategameContainer.show()
    }

    updateBoard(row, col, icon) {
        let boardBtn = this.BOARD_GRID.children().eq(row * 3 + col)
        boardBtn.text(icon)
        boardBtn.removeClass('EMPTY')
        boardBtn.addClass(icon.toUpperCase())

        this.BOARD_GRID.removeClass(`${icon.toUpperCase()}-turn`)
        this.BOARD_GRID.addClass(`${icon.toUpperCase() === 'O' ? 'X' : 'O'}-turn`)
    }

    addNewJoinableGame(game) {
        let joinableGame = this.TMP_JOINABLE_GAME.clone()
        
        joinableGame.attr('data-player',`${game.players[0].id} - ${game.players[0].username}`)
        joinableGame.attr('data-gameid',`${game.id}`)

        $('.playerid', joinableGame).text(`#${game.players[0].id}`)
        $('.playername', joinableGame).text(game.players[0].username)

        $('.join-btn', joinableGame).on('click', (e) => {
            this.wsFrontendDispatcher.dispatchFromMsg(WSMessage.createMessageStructure(
                'game',
                'requestJoinGame',
                [game.id]
            ), this.websocket)
        })


        $(".games",this.showgameContainer).append(joinableGame)
    }

    removeJoinableGame(gameId) {
        $(".games",this.showgameContainer).children().each((i, ele) => {
            if($(ele).attr('data-gameid') == gameId) {
                $(ele).fadeOut("fast").remove()
            }
        })
    }

    exitGame() {
        this.showgameContainer.show()
        this.creategameContainer.hide()

        this.BOARD_GRID.attr('class','board')
        this.BOARD_GRID.children().each((i,ele) => $(ele).remove())

        $('.info-player-icon' ,this.infoPlayer).attr( 'class', '' )
        $('.info-player-icon' ,this.infoPlayer).text('')
        
    }
}