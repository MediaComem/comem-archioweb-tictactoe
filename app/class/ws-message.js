
/*
    Message data structure :
    {
        "resource":"[RESOURCE_NAME]"
        "command":"[COMMAND_NAME"],
        "param": {
            "param1":"zzz",
            ...
        }
    }

    Response data structure : 
    {
        "code":200 -> ok | 404 -> not found | 500 -> server error,
        "codeMsg":"See above code",
        "resource":"",
        "response":{
            ...
        }
    }

*/

module.exports = class {
    static PROTOCOL_CODE = {
        200: "OK",
        201: "Created",
        202: "Accepted",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        418: "I'm a Teapot",
        500: "Internal Server Error"
    }

    static sendResponseMessage(response, resource, command, code) {
        return {
            "code": code,
            "codeMsg": this.PROTOCOL_CODE[code],
            "resource": resource,
            "command": command,
            "response": response
        }
    }

    static sendResOK(response, resource, command) {
        return this.sendResponseMessage(response, resource, command, this.PROTOCOL_CODE[200])
    }

    static sendErrorMessage(errorMsg, code) {
        return this.sendResponseMessage(errorMsg, undefined, code)
    }
}