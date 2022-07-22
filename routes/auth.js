const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  console.log(req.body);
  res.status(200).json({ userId: "userId", token: "token" });
});

router.post("/signup", (req, res) => {
  res.status(200).json({ message: "message" });
});

module.exports = router;
