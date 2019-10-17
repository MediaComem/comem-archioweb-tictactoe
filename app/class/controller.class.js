const WSMessage = require('./ws-message')


module.exports = class {
    constructor(resourceName) {
        this.WS_MESSAGE = WSMessage
        this.RESOURCE_NAME = resourceName
    }

    sendOK(response, cmd) {
        return this.WS_MESSAGE.sendResOK(response, this.RESOURCE_NAME, cmd)
    }

    sendMessage(command, params=[]) {
        return this.WS_MESSAGE.sendMessage(this.RESOURCE_NAME, command, params)
    }
}