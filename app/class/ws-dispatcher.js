const WSMessage = require('./ws-message')


module.exports = class {

    constructor() {
        this.route = this.initRouteController()
    }


    initRouteController() {
        return {}
    }

    dispatchFromMsg(msg) {
        msg = JSON.parse(msg)

        console.log("--- MESSAGE RECEIVED ----\n", msg)

        if ((msg.command === undefined || msg.command === null)
            || (msg.resource === undefined || msg.resource === null)
            || (this.route[msg.resource] === undefined || this.route[msg.resource] === null)
            || (this.route[msg.resource][msg.command] === undefined || this.route[msg.resource][msg.command] === null)) {
            return WSMessage.sendResponseMessage({}, WSMessage.PROTOCOL_CODE[400])
        }

        console.log("------ EXECUTED FUNCTION -------\n", this.route[msg.resource][msg.command], ...msg.params)

        return this.route[msg.resource][msg.command](...msg.params)
    }
}