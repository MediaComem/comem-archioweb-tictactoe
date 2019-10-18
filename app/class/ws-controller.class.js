const WSMessage = require('./ws-message')


module.exports = class {
    constructor(resourceName,) {
        this.RESOURCE_NAME = resourceName
    }

    sendResourceMessage(command, params=[], ws) {
        let wsMessage = new WSMessage(ws)
        return wsMessage.sendMessage(this.RESOURCE_NAME, command, params)
    }
}