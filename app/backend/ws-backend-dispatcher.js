const WSDispatcher = require('../class/ws-dispatcher')
const GameController = require('../backend/controller/game.controller')
const PlayerController = require('../backend/controller/player.controller')

module.exports = class extends WSDispatcher{
    
    initRouteController(){
        return {
            'game': new GameController(),
            'player': new PlayerController()
        }
    }
    
    constructor(){
        super()
    }

}