const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

class User {
  constructor() {
    this.createSchema();
    this.createModel();
  }

  createSchema() {
    this.userSchema = new mongoose.Schema({
      email: { type: String, unique: true },
      password: { type: String },
    });
    this.userSchema.plugin(uniqueValidator);
  }

  createModel() {
    this.UserModel = mongoose.model('User', this.userSchema);
  }

  newUser = ({ email, password }) => {
    const user = new this.UserModel({ email, password });
    return user.save();
  };

  getUser = (email) => this.UserModel.findOne({ email }).exec();
}

const user = new User();

module.exports = user;
