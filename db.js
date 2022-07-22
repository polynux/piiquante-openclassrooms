const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
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
  email: { type: String, unique: true },
  password: { type: String }
});
userSchema.plugin(uniqueValidator);

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

const createUser = ({ email, password }) => {
  let user = new User({ email, password });
  return user
    .save()
    .then(() => "Utilisateur enregistré")
    .catch(err => err);
};

const getUser = ({ email, password }) => {
  return User.findOne({ email, password })
    .then(user => user)
    .catch(err => err);
};

module.exports = { User, Sauce, mongoose, createUser, getUser };
