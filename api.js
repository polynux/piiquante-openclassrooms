const express = require("express");

const sauces = require('./routes/sauces');
const auth = require('./routes/auth');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/api/sauces', sauces);
app.use('/api/auth', auth);

module.exports = app;
