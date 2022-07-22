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

class User {
  constructor() {
    this.createSchema();
    this.createModel();
  }
  createSchema() {
    this.userSchema = new mongoose.Schema({
      email: { type: String, unique: true },
      password: { type: String }
    });
    this.userSchema.plugin(uniqueValidator);
  }

  createModel() {
    this.userModel = mongoose.model("User", this.userSchema);
  }

  newUser = ({ email, password }) => {
    let user = new this.userModel({ email, password });
    return user.save();
  };

  getUser = ({ email, password }) => {
    return this.userModel.findOne({ email, password });
  };
}

class Sauce {
  constructor() {
    this.createSchema();
    this.createModel();
  }
  createSchema() {
    this.sauceSchema = new mongoose.Schema({
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
  }

  createModel() {
    this.sauceModel = mongoose.model("Sauce", this.sauceSchema);
  }

  newSauce(sauce) {
    let newSauce = new this.sauceModel(sauce);
    return newSauce.save();
  }

  getAllSauces() {
    return this.sauceModel.find();
  }

  getSauce(id) {
    return this.sauceModel.findById(id);
  }
}

module.exports = { User, Sauce };
