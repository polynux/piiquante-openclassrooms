const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

function extractToken(authorization) {
  if (authorization === undefined) return false;
  const matches = authorization.match(/(bearer)\s+(\S+)/i);
  return matches && matches[2];
}

function checkToken(req, res, next) {
  const token = req.headers.authorization && extractToken(req.headers.authorization);

  if (!token) return res.status(401).json({ message: "Error! Need a token." });

  jwt.verify(token, process.env.SECRET, err => {
    return err ? res.status(401).json({ message: "Error! Bad token." }) : next();
  });
}

router.use(checkToken);

router.get("/", (req, res) => {
  res.status(200).json([{ sauce: "test" }]);
});

router.get("/:id", (req, res) => {
  res.status(200).json({ sauce: "test" });
});

router.post("/", (req, res) => {
  res.status(200).json({ message: "message" });
});

router.put("/:id", (req, res) => {
  res.status(200).json({ message: "message" });
});

router.delete("/:id", (req, res) => {
  res.status(200).json({ message: "message" });
});

router.post("/:id/like", (req, res) => {
  res.status(200).json({ message: "message" });
});

module.exports = router;
