const Game = require('../../class/game.class')
const Controller = require('../../class/controller.class')


module.exports = class extends Controller {
    constructor() {
        super('game')
        this.games = Array()
    }

    createNewGame(ws, player) {
        let newGame = new Game(this.games.length + 1, player)
        this.games.push(newGame)

        ws.send(this.sendOK(newGame, 'newGame'))
    }

    getJoinableGame(ws) {
        ws.send( this.sendOK(this.games.filter((game) => game.state == Game.STATE.CREATED), 'joinableGames'))
    }

    joinGame(ws, player, gameId) {
        let gameToJoin = this.games.find((game) => game.id === gameId)
        gameToJoin.players.push(player)
        ws.send(this.sendOK(gameToJoin, 'joinningGame'))
    }

    updateBoardRequest(ws, gameId ,row, col) {
        let game = this.games.find(game => game.id==gameid)

        if(!game){
            ws.send(this.WS_MESSAGE.sendError('No game found for id : '+gameId, this.WS_MESSAGE.PROTOCOL_CODE[400]))
            return
        }

        console.log("Game found",game)

        if(game.isCellEmpty(row,col)){
            
            ws.send(this.sendOK({row, col},'updateBoard'))
        }else{
            ws.send(this.sendOK('','invalidMove'))
        }
    }
}