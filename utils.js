const fs = require('fs');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sha256 = require('crypto-js/sha256');
const TokenClass = require('./db/token');

require('dotenv').config();

const expirationTime = parseInt(process.env.EXPIRE_TIME, 10) || 3600;
const Token = new TokenClass(expirationTime);

const genToken = (id) => {
  const token = jwt.sign({ id }, process.env.SECRET, { expiresIn: expirationTime });
  return Token.newToken({ token, userId: id });
};

const hashPassword = (password) => bcrypt.hash(password, 10);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

const hashEmail = (email) => sha256(email).toString();

// delete file
const unlinkAsync = promisify(fs.unlink);

const extractToken = (authorization) => {
  if (authorization === undefined) return false;
  const matches = authorization.match(/(bearer)\s+(\S+)/i);
  return matches && matches[2];
};

const getToken = (authorization) => authorization && extractToken(authorization);

const verifyToken = (authorization) => {
  const token = getToken(authorization);
  return Token.getToken(token)
    .then((tokenObj) => {
      if (!tokenObj) throw new Error('Token not found');
      return jwt.verify(tokenObj.token, process.env.SECRET, (err, decoded) => ({ decoded, err }));
    })
    .catch((err) => ({ err }));
};

const decodeToken = (authorization) => {
  const token = getToken(authorization);
  if (!token) return false;
  return jwt.decode(token);
};

module.exports = {
  genToken,
  verifyToken,
  decodeToken,
  hashPassword,
  comparePassword,
  unlinkAsync,
  hashEmail,
};
