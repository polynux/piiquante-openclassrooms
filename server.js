const db = require("./db");
const app = require("./api");
const server = require("http").createServer(app);

server.on("listening", () => {
  console.log("Listening on 3000");
});

let User = new db.User();

User.createUser({ email: "test2@gmail.com", password: "test" }).then(console.log);
User.getUser({ email: "test2@gmail.com", password: "tests" }).then(console.log);

server.listen(3000);
