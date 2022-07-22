const mongoose = require("mongoose");
require("dotenv").config();

const dbUrl = process.env.DB_URL.replace(
  "<username>:<password>",
  `${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}`
)
  .replace("<host>", process.env.DB_HOST)
  .replace("<database>", process.env.DB_DATABASE);

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
