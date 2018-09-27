const req = require("axios");
const config = require("./config");
const balancer = require("./balancer");


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function project(id) {
    return new Promise((resolve, reject) => {
        req.get(config.url + `/v2/projects_users/${id}`, {
            headers: { "Authorization": "Bearer " + balancer.getToken() }
        }).then(r => {
            if (r.data)
                resolve(r.data)
            else
                reject({error: "request has an error", r})
        }).catch(e => console.log(e))
    })
}

function teams(id) {
    return new Promise((resolve, reject) => {
        req.get(config.url + `/v2/teams/${id}`, {
            headers: { "Authorization": "Bearer " + balancer.getToken() }
        }).then(r => {
            if (r.data)
                resolve(r.data)
            else
                reject({error: "request has an error", r})
        }).catch(e => console.log(e))
    })
}

function campusUser(campus, year, page) {
    return new Promise((resolve, reject) => {
        req.get(config.url + `/v2/campus/${campus}/users?per_page=100&page=${page}&filter[pool_year]=${year}`, {
            headers: { "Authorization": "Bearer " + balancer.getToken() }
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
            headers: { "Authorization": "Bearer " + balancer.getToken() }
        }).then(r => {
            if (r.data)
                resolve(r.data)
            else
                reject({error: "request has an error", r})
        }).catch(e => console.log(e))
    })
}

module.exports = {user, campusUser, project, teams, sleep}