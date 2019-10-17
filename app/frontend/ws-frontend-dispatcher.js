const WSDispatcher = require('../class/ws-dispatcher')
const GameController = require('./controller/game.controller')
const PlayerController = require('./controller/player.controller')

module.exports = class extends WSDispatcher{
        
    constructor(gameController, playerController){
        super('game')
        this.route.game = gameController
        this.route.player = playerController
    }

    
}