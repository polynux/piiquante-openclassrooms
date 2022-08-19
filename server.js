const http = require('http');
const app = require('./api');
const db = require('./db');

const server = http.createServer(app);
const port = process.env.PORT || 3000;

db.connect()
  .then(() => console.log('connected to mongodb'))
  .catch((err) => console.error(err));

server.on('listening', () => {
  console.log('Listening on 3000');
});

server.listen(port);
