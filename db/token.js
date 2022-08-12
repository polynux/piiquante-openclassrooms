const mongoose = require('mongoose');

class Token {
  constructor(expiration = 3600) {
    this.createSchema(expiration);
    this.createModel();
  }

  createSchema(expiration) {
    this.tokenSchema = new mongoose.Schema({
      token: { type: String, required: true },
      userId: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      expireAt: { type: Date, default: Date.now, expires: expiration },
      lifeSpan: { type: Number, default: expiration },
    });
  }

  createModel() {
    this.TokenModel = mongoose.model('Token', this.tokenSchema);
  }

  newToken = (obj) => {
    const tokenObj = new this.TokenModel(obj);
    return tokenObj.save();
  };

  getToken = (token) => this.TokenModel.findOne({ token }).exec();

  delToken = (token) => this.TokenModel.findOneAndDelete({ token }).exec();
}

module.exports = Token;
