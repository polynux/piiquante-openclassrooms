const express = require("express");
const sauces = require("./routes/sauces");
const auth = require("./routes/auth");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/sauces", sauces);
app.use("/api/auth", auth);

module.exports = app;
