const WSMessage = require('./ws-message')


module.exports = class {

    constructor() {
        this.route = this.initRouteController()
    }


    initRouteController() {
        return {}
    }

    checkMsgValidity(msg) {
        return (msg.command === undefined || msg.command === null)
            || (msg.resource === undefined || msg.resource === null)
            || (this.route[msg.resource] === undefined || this.route[msg.resource] === null)
            || (this.route[msg.resource][msg.command] === undefined || this.route[msg.resource][msg.command] === null)
    }

    dispatchFromMsg(msg, ws) {
        
        try {
            msg = JSON.parse(msg)
        } catch (err) {
            console.err(err)
            return
        }


        console.log("--- MESSAGE RECEIVED ----\n", msg)

        if (this.checkMsgValidity(msg)) {
            

            ws.send(WSMessage.sendError("", WSMessage.PROTOCOL_CODE[400]))
            return
        }


        // Received message is a response
        if (msg.code !== undefined) {
            console.log("------ EXECUTED FUNCTION -------\n",
                this.route[msg.resource][msg.command], msg.response)

            this.route[msg.resource][msg.command](ws, msg.response)

        } else { // receive message is not a response
            console.log("------ EXECUTED FUNCTION -------\n",
                this.route[msg.resource][msg.command], msg.params)

            if (!Array.isArray(msg.params)) {
                msg.params = [msg.params]
            }

            this.route[msg.resource][msg.command](ws,...msg.params)
        }

    }
}