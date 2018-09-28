const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const requests = require("./requests");
const users = require("./users");
const balancer = require("./balancer");
const stats = require("stats-lite")
const printf = require('printf');

async function retrieveCorrectors(correctorsOccurence, teamId) {
    let hasFeedback = false
    let team = await requests.teams(teamId);
    if (team["scale_teams"]) {
        if (team["scale_teams"].length !== 0) hasFeedback = true
        for (let feedback of team["scale_teams"]) {
            let login = feedback.corrector.login
            if (!correctorsOccurence[login]) correctorsOccurence[login] = 1
            else correctorsOccurence[login] = correctorsOccurence[login] + 1
            // console.log("   -", login, correctorsOccurence[login])
        }
    }
    return hasFeedback
}

function printInfo({numArray, retrys, array, numOfProjects}) {
    console.log()
    console.log("Numbers of corrections    : ", stats.sum(numArray));
    console.log("Average per correctors    : ", stats.mean(numArray));
    console.log("Maybe friends correctors  : ", stats.percentile(numArray, 0.85));
    console.log("Average of retry          : ", stats.mean(retrys))

    array.sort((a, b) => {
        return b.count - a.count
    })

    console.log()
    console.log("Friends correctors : ")

    array.forEach(e => {
        let p = (e.count / stats.sum(numArray)) * 100
        if (e.count >= stats.percentile(numArray, 0.85)) console.log(" -", e.login, p.toPrecision(2) + "%", e.count, "times")
    })
}

async function retrieveUserStats(user) {

    let correctorsOccurence = {}

    let numOfProjects = 0
    let retrys = []
    let sessionsProject = []

    let projects = user["projects_users"].filter(e => e["cursus_ids"].includes(1))

    let projectsValidated = projects.filter(p => p["validated?"])
    for (let project of projectsValidated) {
        let sessionProject = await requests.project(project.id)
        sessionsProject.push(sessionProject)
        retrys.push(sessionProject.teams.length)
        for (let teamInfo of sessionProject.teams) {
            await requests.sleep(100)
            if (await retrieveCorrectors(correctorsOccurence, teamInfo.id)) numOfProjects++
        }
    }

    let array = Object.keys(correctorsOccurence).map(e => ({login: e, count: correctorsOccurence[e]}))
    let numArray = array.map(e => e.count)

    return {login: user.login, array, numArray, numOfProjects, retrys, projects: sessionsProject}
}

// balancer.init().then(async function () {
//     let userCorrections = {}
//     let listUsers = users.list(9, 2017)
//     let index = 1
//
//     const adapter = new FileSync(`db/corrections_9_2017.json`)
//     const db = low(adapter)
//
//     db.defaults({corrections: []}).write()
//
//     for (let u of listUsers) {
//         process.stdout.write(printf('%-10s %-8s', u.login,  index + "/" +  listUsers.length))
//         db.get('corrections')
//             .push(await retrieveUserStats(u))
//             .write()
//         process.stdout.write(printf("  OK\n"))
//         index++
//     }
//
//     db.defaults(userCorrections).write()
// })

const adapter = new FileSync(`db/corrections_9_2017.json`)
const db = low(adapter).getState()

let list = db.corrections.filter(e => e.array.length > 0)
list.forEach((e) => e.array.sort((a, b) => {
    return b.count - a.count
}))

list.sort((a, b) => b.array[0].count - a.array[0].count)

list.forEach((e,i) => {
    console.log("\n-------------------\n")
    console.log(i+1, e.login)
    printInfo(e)
})