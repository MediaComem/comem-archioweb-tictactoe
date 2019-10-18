module.exports = class {
    constructor(websocket) {
        this.websocket = websocket

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
            showgameContainer.toggle()

            wsFrontendDispatcher.dispatchFromMsg(WSMessage.createMessageStructure(
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

        this.creategameContainer.show()
    }

    updateBoard(row, col, icon) {
        this.BOARD_GRID.children().eq(row * 3 + col).text(icon)
    }

    addNewJoinableGame(game) {
        let joinableGame = this.TMP_JOINABLE_GAME.clone()
        $(".playerId", joinableGame).text(game.player.id)
        $(".playername", joinableGame).text(game.player.username)
        this.showgameContainer.append(joinableGame)
    }
}