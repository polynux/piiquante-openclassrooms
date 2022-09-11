const express = require('express');
const cors = require('cors');
const path = require('path');
const sauces = require('./routes/sauces');
const auth = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/sauces', sauces);
app.use('/api/auth', auth);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON' });
  }
  res.status(500).send('Something broke!');
});

module.exports = app;
