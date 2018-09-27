const req = require("axios");
const config = require("./config");

const size = process.env.CLIENT_UID.split(",").length

const uids = process.env.CLIENT_UID.split(",")
const secrets = process.env.CLIENT_SEC.split(",")

let index = 0

let tokens = {}

function token() {
    let promises = []
    for (let i = 0; i < size; i++) {
        promises.push(req.post(config.url + "/oauth/token", {
            grant_type: "client_credentials",
            client_id: uids[i],
            client_secret: secrets[i],
        }).then((r) => {
            if (r.data && r.data["access_token"])
                tokens[i] = r.data["access_token"]
        }))
    }
    return Promise.all(promises)
}


function init() {
    let result = token()
    setInterval(token, 120000)
    return result
}

function getToken() {
    let tok = tokens[index]
    //console.log(tok, index)
    index++
    if (index > size - 1) {
        index = 0
    }
    return tok
}

module.exports = {init, getToken}