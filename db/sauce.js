const mongoose = require('mongoose');
const mongooseErrors = require('mongoose-errors');

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
      usersLiked: [String],
      usersDisliked: [String],
    });
    this.sauceSchema.plugin(mongooseErrors);
  }

  createModel() {
    this.SauceModel = mongoose.model('Sauce', this.sauceSchema);
  }

  newSauce(sauce) {
    const newSauce = new this.SauceModel(sauce);
    return newSauce.save();
  }

  getAllSauces() {
    return this.SauceModel.find();
  }

  getSauce(id) {
    return this.SauceModel.findById(id);
  }

  editSauce(id, sauce) {
    return this.SauceModel.findByIdAndUpdate(id, sauce, { new: false });
  }

  deleteSauce(id) {
    return this.SauceModel.findByIdAndDelete(id);
  }
}

const sauce = new Sauce();

module.exports = sauce;
