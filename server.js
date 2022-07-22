const { User, Sauce, mongoose } = require("./db");
const app = require("./api");
const server = require("http").createServer(app);

server.on("listening", () => {
    console.log("Listening on 3000");
});

server.listen(3000);
