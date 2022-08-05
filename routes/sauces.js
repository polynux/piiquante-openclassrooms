const fs = require('fs');
const { promisify } = require('util');
const router = require('express').Router();
const multer = require('multer');
const uuidv4 = require('uuid').v4;
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Sauce = require('../db/sauce');

// delete file
const unlinkAsync = promisify(fs.unlink);

function extractToken(authorization) {
  if (authorization === undefined) return false;
  const matches = authorization.match(/(bearer)\s+(\S+)/i);
  return matches && matches[2];
}

function getToken(req) {
  const token = req.headers.authorization && extractToken(req.headers.authorization);
  return token;
}

function checkToken(req, res, next) {
  const token = getToken(req);

  if (!token) return res.status(401).json({ message: 'Error! Need a token.' });

  return jwt.verify(token, process.env.SECRET, (err) => (err ? res.status(401).json({ message: 'Error! Bad token.' }) : next()));
}

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads'),
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const uploadImage = multer({ storage }).single('image');

router.use(checkToken);

router.get('/', (req, res) => {
  Sauce.getAllSauces()
    .then((sauces) => {
      if (!sauces) {
        return res.status(500).json({ message: 'Error! Could not get sauces.' });
      }
      sauces = sauces.map((sauce) => {
        sauce.imageUrl = `http://localhost:3000/uploads/${sauce.imageUrl}`;
        return sauce;
      });
      return res.status(200).json(sauces);
    })
    .catch(res.status(500));
});

router.get('/:id', (req, res) => {
  Sauce.getSauce(req.params.id)
    .then((sauce) => {
      if (!sauce) {
        return res.status(500).json({ message: 'Error! Could not get sauce.' });
      }
      sauce.imageUrl = `http://localhost:3000/uploads/${sauce.imageUrl}`;
      return res.status(200).json(sauce);
    })
    .catch(res.status(500));
});

function createSauce(req, res) {
  const sauce = JSON.parse(req.body.sauce);
  sauce.imageUrl = req.file.filename;
  sauce.usersLiked = [];
  sauce.usersDisliked = [];
  sauce.likes = 0;
  sauce.dislikes = 0;

  Sauce.newSauce(sauce)
    .then((sauceDb) => {
      if (!sauceDb) {
        return res.status(500).json({ message: 'Error! Could not create sauce.' });
      }
      return res.status(200).json({ message: 'Sauce created' });
    })
    .catch(res.status(500));
}

router.post('/', uploadImage, createSauce);

function isUserAuthorized(sauceUserId, req) {
  const token = getToken(req);
  const decodedToken = jwt.decode(token);
  return decodedToken.id === sauceUserId;
}

function editSauce(req, res) {
  let sauce = req.body;
  if (req.body.sauce) {
    sauce = JSON.parse(req.body.sauce);
    sauce.imageUrl = req.file.filename;
  }
  if (!isUserAuthorized(sauce.userId, req)) {
    return res.status(403).json({ message: 'Error! You are not authorized to edit this sauce.' });
  }
  const newImageUrl = sauce.imageUrl;

  return Sauce.editSauce(req.params.id, sauce)
    .then((oldSauce) => {
      if (!oldSauce) {
        return res.status(500).json({ message: 'Error! Could not edit sauce.' });
      }
      if (newImageUrl !== undefined && newImageUrl !== oldSauce.imageUrl) {
        unlinkAsync(path.join(__dirname, `../public/uploads/${oldSauce.imageUrl}`));
      }
      return res.status(200).json({ message: 'Sauce edited' });
    })
    .catch(res.status(500));
}

router.put('/:id', uploadImage, editSauce);

function deleteSauce(req, res) {
  Sauce.getSauce(req.params.id).then((sauce) => {
    if (!sauce) {
      return res.status(500).json({ message: 'Error! Could not get sauce.' });
    }
    if (!isUserAuthorized(sauce.userId, req)) {
      return res.status(403).json({ message: 'Error! You are not authorized to delete this sauce.' });
    }
    return Sauce.deleteSauce(req.params.id)
      .then(() => {
        unlinkAsync(path.join(__dirname, `../public/uploads/${sauce.imageUrl}`));
        return res.status(200).json({ message: 'Sauce deleted' });
      }).catch(res.status(500));
  }).catch(res.status(500));
}

router.delete('/:id', deleteSauce);

function userListContains(list, userId) {
  return list.find((user) => user === userId) !== undefined;
}

function removeUserFromList(list, userId) {
  return list.filter((user) => user !== userId);
}

function likeSauce(sauce, userId) {
  sauce.usersLiked.push(userId);
  if (userListContains(sauce.usersDisliked, userId)) {
    sauce.dislikes--;
  }
  sauce.usersDisliked = removeUserFromList(sauce.usersDisliked, userId);
  sauce.likes++;

  return sauce;
}

function dislikeSauce(sauce, userId) {
  sauce.usersDisliked.push(userId);
  if (userListContains(sauce.usersLiked, userId)) {
    sauce.likes--;
  }
  sauce.usersLiked = removeUserFromList(sauce.usersLiked, userId);
  sauce.dislikes++;

  return sauce;
}

function clearLikes(sauce, userId) {
  if (userListContains(sauce.usersDisliked, userId)) {
    sauce.dislikes--;
  }
  if (userListContains(sauce.usersLiked, userId)) {
    sauce.likes--;
  }
  sauce.usersLiked = removeUserFromList(sauce.usersLiked, userId);
  sauce.usersDisliked = removeUserFromList(sauce.usersDisliked, userId);
  return sauce;
}

function setLikes(req, res) {
  const { userId } = req.body;
  Sauce.getSauce(req.params.id)
    .then((sauce) => {
      if (!sauce) {
        return res.status(500).json({ message: 'Error! Could not get sauce.' });
      }

      if (req.body.like === 1) {
        if (userListContains(sauce.usersLiked, userId)) {
          return res.status(401).json({ message: 'Sauce already liked' });
        }
        sauce = likeSauce(sauce, userId);
      } else if (req.body.like === -1) {
        if (userListContains(sauce.usersDisliked, userId)) {
          return res.status(401).json({ message: 'Sauce already disliked' });
        }
        sauce = dislikeSauce(sauce, userId);
      } else if (req.body.like === 0) {
        sauce = clearLikes(sauce, userId);
      }

      return Sauce.editSauce(req.params.id, sauce);
    })
    .then((sauce) => {
      if (!sauce) {
        return res.status(500).json({ message: 'Error! Could not edit sauce.' });
      }
      return res.status(200).json({ message: 'Sauce liked' });
    })
    .catch(res.status(500));
}

router.post('/:id/like', setLikes);

module.exports = router;
