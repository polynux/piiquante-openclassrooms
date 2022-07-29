const router = require("express").Router();
const multer = require("multer");
const uuidv4 = require("uuid").v4;
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Sauce = new (require("../db.js").Sauce)();

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

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/uploads"),
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.use(checkToken);

router.get("/", (req, res) => {
  res.status(200).json([{ sauce: "test" }]);
});

router.get("/:id", (req, res) => {
  res.status(200).json({ sauce: "test" });
});

function createSauce(req, res) {
  let sauce = JSON.parse(req.body.sauce);
  sauce.imageUrl = "/uploads/" + req.file.filename;
  sauce.usersLiked = [];
  sauce.usersDisliked = [];
  sauce.likes = 0;
  sauce.dislikes = 0;

  Sauce.newSauce(sauce)
    .then(sauce => {
      if (!sauce) {
        return res.status(500).json({ message: "Error! Could not create sauce." });
      }
      return res.status(200).json({ message: "Sauce created" });
    })
    .catch(res.status(500));
}

router.post("/", upload.single("image"), createSauce);

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
