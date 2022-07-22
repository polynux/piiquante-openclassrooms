const mongoose = require("mongoose");
require("dotenv").config();

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;
const dbUrl = process.env.DB_URL.replace("<username>:<password>", `${username}:${password}`).replace(
  "<database>",
  database
);

mongoose
  .connect(dbUrl)
  .then(() => console.log("connected to mongodb"))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  email: { type: String },
  password: { type: String }
});
const sauceSchema = new mongoose.Schema({
  userId: String,
  name: String,
  manufacturer: String,
  description: String,
  mainPepper: String,
  imageUrl: String,
  heat: Number,
  likes: Number,
  dislikes: Number,
  usersLiked: [{ userId: String }],
  usersDisliked: [{ userId: String }]
});

let User = mongoose.model("User", userSchema);
let Sauce = mongoose.model("Sauce", sauceSchema);

module.exports = { User, Sauce, mongoose };
