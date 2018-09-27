const requests = require("./requests");
const users = require("./users");
const balancer = require("./balancer");


balancer.init().then(async () => {

    let correctorsOccurence = {}
    let user = users.list(9, 2017).find(e => e.login === "xamartin")

    console.log("Target: ", user.login)

    // id, occurence, final_mark, current_team_id, status, validated?, project.slug
    let projects = user["projects_users"].filter(e => e["cursus_ids"].includes(1))

    for (let project of projects.filter(p => p["validated?"])) {
        console.log(project.project.slug)
        await requests.sleep(100)
        let team = await requests.teams(project["current_team_id"]);
        if (team["scale_teams"]) {
            for (let feedback of team["scale_teams"]) {
                if (!correctorsOccurence[feedback.corrector.login]) correctorsOccurence[feedback.corrector.login] = 1
                else correctorsOccurence[feedback.corrector.login] = correctorsOccurence[feedback.corrector.login] + 1
                console.log("   -", feedback.corrector.login, correctorsOccurence[feedback.corrector.login])
            }
        }
    }

    let toArray = Object.keys(correctorsOccurence).map(e => ({login: e, count: correctorsOccurence[e]}))
    toArray.sort((a, b) => {
        return b.count - a.count
    })
    console.log(toArray)
    // team["scale_teams"].forEach(feedback => {
    //     feedback["corrector"].forEach(corrector => {
    //         console.log("  ",corrector.login)
    //         if (!correctorsOccurence[corrector.login]) correctorsOccurence[corrector.login] = 1
    //         else correctorsOccurence[corrector.login] = correctorsOccurence[corrector.login] + 1
    //     })
    // })
})

// console.log(correctorsOccurence)
//
// // //let project = await requests.project(748105)
// // let team = await requests.teams(projects[2]["current_team_id"]);
// //
// // team["scale_teams"].forEach(e => {
// //     console.log(e["corrector"]);
// // })
//
// //console.log(JSON.stringify(team, null, 2))
// //users.createUsersData(9, 2017).then(() => console.log("Yeah"))
// //requests.user("edevos").then(e=> console.log(JSON.stringify(e)))
// //setInterval(setupToken, 1000 * 30)
// })
// ;