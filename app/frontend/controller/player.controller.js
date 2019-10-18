const Controller = require('../../class/ws-controller.class')
const Player = require('../../class/player.class')
const LCS_MANAGER = require('../localstorage-manager')


module.exports = class extends Controller {
    constructor() {
        super('player')
    }


    receiveMyPlayer(ws, playerFromServer) {
        LCS_MANAGER.save('player', playerFromServer)
    }
}