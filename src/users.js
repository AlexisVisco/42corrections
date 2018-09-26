const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const requests = require("./requests");

async function createUsersList(campus, year) {

    console.log(`start: createUsersList(${campus}, ${year})`)
    let users = []
    let page = 1;

    while (true) {
        let list = await requests.campusUser(campus, year, page)
        users = users.concat(list)
        if (list.length === 0) break
        console.log(`fetched: ${list.length} user(s) page: ${page} first: ${list[0].login}`)
        await requests.sleep(200);
        page++
    }

    const adapter = new FileSync(`db/raw_${campus}_${year}.json`)
    const db = low(adapter)

    db.defaults(users).write()
    console.log(`end: createUsersList(${campus}, ${year}) total: ${users.length} users`)
}

async function createUsersData(campus, year) {
    console.log(`start: createUsersData(${campus}, ${year})`)

    const adapter = new FileSync(`db/raw_${campus}_${year}.json`)
    const db = low(adapter).getState()

    let users = []

    for (u in db) {
        const user = await requests.user(db[u].login)

        if (user["cursus_users"].some(e => e["cursus_id"] === 1)) {
            console.log(`fetch: ${db[u].login}\t\tOK`)
            users.push(user)
        } else {
            console.log(`fetch: ${db[u].login}\t\tKO`)
        }

    }

    const tadapter = new FileSync(`db/data_${campus}_${year}.json`)
    const dbFull = low(tadapter)

    dbFull.defaults(users).write()
    console.log(`end: createUsersData(${campus}, ${year}) total: ${users.length} users`)

}

module.exports = {createUsersList, createUsersData}