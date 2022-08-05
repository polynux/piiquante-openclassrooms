const mongoose = require('mongoose');

class Token {
  constructor() {
    this.createSchema();
    this.createModel();
  }

  createSchema() {
    this.tokenSchema = new mongoose.Schema({
      token: String,
    });
  }

  createModel() {
    this.TokenModel = mongoose.model('Token', this.tokenSchema);
  }

  newToken = (token) => {
    const tokenObj = new this.UserModel(token);
    return tokenObj.save();
  };

  getToken = (token) => this.TokenModel.findOne({ token }).exec();
}

const token = new Token();

module.exports = token;
