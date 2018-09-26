const requests = require("./requests");
const users = require("./users");


requests.setupToken().then(() => {
    users.createUsersData(9, 2017).then(() => console.log("Yeah"))
    //requests.user("edevos").then(e=> console.log(JSON.stringify(e)))
    //setInterval(setupToken, 1000 * 30)
});