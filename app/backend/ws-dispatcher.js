/*
    Message data structure :
    {
        "command":"[COMMAND_NAME"],
        "param": {
            "param1":"zzz",
            ...
        }
    }

    Response data structure : 
    {
        "code":200 -> ok | 404 -> not found | 500 -> server error,
        "codeMsg":"See above code"
        "response":{
            ...
        }
    }

*/

const newErrorMsg = (msg)=>{return {}}


module.exports = {
    dispatchFromMsg(msg) {
        if(msg.command === undefined || msg.command === null){
            return {}
        }
    }
}