const router = require("express").Router();
const User = new (require("../db.js").User)();
require("dotenv").config();
const jwt = require("jsonwebtoken");

function genToken(id) {
  return jwt.sign({ id }, process.env.SECRET);
}

router.post("/login", (req, res) => {
  let user = User.getUser(req.body);
  res.status(200).json({ userId: user._id, token: genToken(user._id) });
});

router.post("/signup", (req, res) => {
  res.status(200).json({ message: "message" });
});

module.exports = router;
