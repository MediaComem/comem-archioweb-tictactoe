const WS_URL = "ws://localhost:8081"
const User = require('../class/user.class')
let ws = new WebSocket(WS_URL)


/*
Message data structure :
    {
        "resource":"[RESOURCE_NAME]",
        "command":"[COMMAND_NAME]",
        "params": {
            "param1":"zzz",
            ...
        }
    }

*/

let user = new User(1,"test")
console.log(user)

ws.onopen = (e) => {
    ws.send(JSON.stringify({
        "resource": "game",
        "command": "createNewGame",
        "params": [
            { username: "player-1" },
        ]
    }))

}

ws.onmessage = (e) => {
    console.log("--- MESSAGE RECEIVED ---",JSON.parse(e.data))
}