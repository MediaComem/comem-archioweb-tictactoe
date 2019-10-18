const WSController = require('../../class/ws-controller.class')
const LCS_MANAGER = require('../localstorage-manager')


module.exports = class extends WSController{
    constructor() {
        super('player')
    }


    displayError(msg) {
        alert(msg)
    }
}