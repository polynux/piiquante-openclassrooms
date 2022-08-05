const mongoose = require('mongoose');
require('dotenv').config();

const dbUrl = process.env.DB_URL.replace(
  '<username>:<password>',
  `${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}`,
)
  .replace('<host>', process.env.DB_HOST)
  .replace('<database>', process.env.DB_DATABASE);

class Db {
  constructor() {
    this.mnongoose = mongoose;
  }

  connect() {
    return this.mnongoose.connect(dbUrl, { useNewUrlParser: true });
  }
}

const db = new Db();

module.exports = db;
