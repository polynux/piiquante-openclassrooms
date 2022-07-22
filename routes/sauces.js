const express = require("express");
const router = express.Router();

router.use((req, res, next) => {
  console.log(req.headers);
  next();
});

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
