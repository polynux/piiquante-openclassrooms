const express = require("express");
const sauces = require("./routes/sauces");
const auth = require("./routes/auth");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/sauces", sauces);
app.use("/api/auth", auth);

module.exports = app;
