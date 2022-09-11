const router = require('express').Router();
require('dotenv').config();
const { comparePassword, hashPassword, genToken, hashEmail } = require('../utils');
const User = require('../db/user');

router.post('/login', (req, res) => {
  const email = hashEmail(req.body.email);
  User.getUser(email)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: 'User not exist!' });
      }
      return comparePassword(req.body.password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.status(401).json({ message: 'Password is incorrect!' });
        }
        return genToken(user._id)
          .then((tokenObj) => res.status(200).json({ userId: user._id, token: tokenObj.token, message: 'Login success!' }))
          .catch(res.status(500));
      });
    })
    .catch(res.status(500));
});

router.post('/signup', (req, res) => {
  hashPassword(req.body.password)
    .then((hash) => {
      const email = hashEmail(req.body.email);
      User.newUser({ ...req.body, password: hash, email })
        .then((user) => {
          if (!user) {
            return res.status(500).json({ message: 'Error! Could not create user.' });
          }
          return genToken(user._id)
            .then((tokenObj) => res.status(200).json({ userId: user._id, token: tokenObj.token }))
            .catch(res.status(500));
        })
        .catch((error) => res.status(400).json({ message: error.info }));
    })
    .catch(res.status(500));
});

module.exports = router;
