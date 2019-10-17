const Controller = require('../../class/controller.class')
const LCS_MANAGER = require('../localstorage-manager')


module.exports = class extends Controller{
    constructor() {
        super('player')
    }


    receiveMyPlayer(ws, player) {
        LCS_MANAGER.save('player', player)
    }
}