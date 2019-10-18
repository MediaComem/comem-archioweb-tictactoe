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

        this.BOARD_GRID = $(".board")

        this.btnCreateNewGame = $('#createNewGame')
        this.btnCreateNewGame.attr('disabled')


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
    }

    displayNewGame(board, btnEvtFunc) {

        board.forEach((row, i) => {
            row.forEach((col, j) => {
                let boardBtn = this.TMP_BOARD_BTN.clone()

                boardBtn.on('click', btnEvtFunc)

                this.BOARD_GRID.append(boardBtn)
            })
        })

        this.showgameContainer.hide()
        this.creategameContainer.show()
    }

    updateBoard(row, col, icon) {
        this.BOARD_GRID.children().eq(row * 3 + col).text(icon)
    }

    addNewJoinableGame(game) {
        let joinableGame = this.TMP_JOINABLE_GAME.clone()
        $(".playerId", joinableGame).text(game.players[0].id)
        $(".playername", joinableGame).text(game.players[0].username)
        this.showgameContainer.append(joinableGame)
    }
}