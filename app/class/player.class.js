module.exports = class {
    constructor(id, username, websocket) {
        this.id = id
        this.username = username
        this.websocket = websocket
    }

    getWithoutWS() {
        let playerWithoutWS = { ...this }
        delete playerWithoutWS.websocket
        return playerWithoutWS
    }
}