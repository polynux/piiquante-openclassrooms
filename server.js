const db = require("./db");
const app = require("./api");
const server = require("http").createServer(app);

server.on("listening", () => {
  console.log("Listening on 3000");
});

db.createUser({ email: "test2@gmail.com", password: "test" }).then(console.log);

server.listen(3000);
