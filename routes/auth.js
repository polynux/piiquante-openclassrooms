const router = require("express").Router();
const User = new (require("../db.js").User)();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function genToken(id) {
  return jwt.sign({ id }, process.env.SECRET);
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

router.post("/login", (req, res) => {
  User.getUser(req.body.email)
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: "UUser not exist!" });
      }
      comparePassword(req.body.password, user.password).then(isMatch => {
        if (!isMatch) {
          return res.status(401).json({ message: "Password is incorrect!" });
        }
        res.status(200).json({
          message: "Login successful",
          userId: user._id,
          token: genToken(user._id)
        });
      });
    })
    .catch(res.status(500));
});

router.post("/signup", (req, res) => {
  hashPassword(req.body.password).then(hash => {
    User.newUser({ ...req.body, password: hash })
      .then(user => {
        res.status(200).json({ userId: user._id, token: genToken(user._id) });
      })
      .catch(res.status(500));
  });
});

module.exports = router;
