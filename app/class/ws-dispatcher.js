const WSMessage = require('./ws-message')


module.exports = class {

    constructor() {
        this.route = this.initRoute()
    }


    initRoute() {
        return {}
    }

    addRoute(routeName, routeController){
        this.route[routeName] = routeController
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
            console.error(err)
            return
        }


        console.log("--- MESSAGE RECEIVED ----\n")

        if (this.checkMsgValidity(msg)) {
            console.error("------ INVALID MESSAGE -------\n", msg)
            return
        }


        console.log("------ EXECUTED FUNCTION -------\n",
            this.route[msg.resource][msg.command], msg.params)

        if (!Array.isArray(msg.params)) {
            msg.params = [msg.params]
        }

        this.route[msg.resource][msg.command](ws, ...msg.params)


    }
}