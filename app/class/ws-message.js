
/*
    Message data structure :
    {
        'resource':'[RESOURCE_NAME]'
        'command':'[COMMAND_NAME'],
        'params': [
            {'param1':'zzz'},
            ...
        ]
    }


*/

module.exports = class {

    constructor(websocketInstance) {
        this.websocketInstance = websocketInstance
    }

    sendMessage(resource, command, params) {
        this.websocketInstance.send(
            this.constructor.createMessageStructure(resource, command, params)
        )
    }

    static sendMessage(resource, command, params, websocketInstance) {
        websocketInstance.send(
            this.createMessageStructure(resource, command, params)

        )
    }

    static createMessageStructure(resource, command, params) {
        return JSON.stringify({
            'resource': resource,
            'command': command,
            'params': params
        })
    }
}