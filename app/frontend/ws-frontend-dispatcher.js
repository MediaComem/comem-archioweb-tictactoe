const WSDispatcher = require('../class/ws-dispatcher')
const GameController = require('./controller/game.controller')

module.exports = class extends WSDispatcher{
    
    initRouteController(){
        return {
            "game": new GameController()
        }
    }
    
    constructor(){
        super()
    }

}