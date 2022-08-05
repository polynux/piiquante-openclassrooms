const mongoose = require('mongoose');

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
    return this.SauceModel.findByIdAndUpdate(id, sauce, { new: true });
  }

  deleteSauce(id) {
    return this.SauceModel.findByIdAndDelete(id);
  }
}

const sauce = new Sauce();

module.exports = sauce;
