const req = require("axios");
const config = require("./config");

let token = undefined

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupToken() {
    return req.post(config.url + "/oauth/token", {
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_UID,
        client_secret: process.env.CLIENT_SECRET,
    }).then((r) => {
        if (r.data && r.data.access_token)
            token = r.data.access_token
    })
}

function campusUser(campus, year, page) {
    return new Promise((resolve, reject) => {
        req.get(config.url + `/v2/campus/${campus}/users?per_page=100&page=${page}&filter[pool_year]=${year}`, {
            headers: { "Authorization": "Bearer " +token }
        }).then(r => {
            if (r.data)
                resolve(r.data)
            else
                reject({error: "request has an error", r})
        }).catch(e => console.log(e))
    })
}

function user(username) {
    return new Promise((resolve, reject) => {
        req.get(config.url + `/v2/users/${username}`, {
            headers: { "Authorization": "Bearer " +token }
        }).then(r => {
            if (r.data)
                resolve(r.data)
            else
                reject({error: "request has an error", r})
        }).catch(e => console.log(e))
    })
}

module.exports = {user, campusUser, setupToken, sleep}