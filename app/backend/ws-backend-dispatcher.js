const WSDispatcher = require('../class/ws-dispatcher')
const GameController = require('../backend/controller/game.controller')
const PlayerController = require('../backend/controller/player.controller')
const GameManager = require('../class/game-manager.class')

module.exports = class extends WSDispatcher{
    
    initRouteController(){
        let gameManager = new GameManager()        

        return {
            'game': new GameController(gameManager),
            'player': new PlayerController(gameManager)
        }
    }
    
    constructor(){
        super()
    }

}