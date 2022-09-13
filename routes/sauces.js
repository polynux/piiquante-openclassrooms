const router = require('express').Router();
const multer = require('multer');
const uuidv4 = require('uuid').v4;
const path = require('path');
const { verifyToken, decodeToken, unlinkAsync } = require('../utils');
require('dotenv').config();
const Sauce = require('../db/sauce');

const checkToken = (req, res, next) =>
  verifyToken(req.headers.authorization)
    .then((token) => {
      if (token.err) {
        return res.status(401).json({ message: 'Unauthorized', error: token.err });
      }
      return next();
    })
    .catch((err) => res.status(401).json({ message: 'Token not found!', error: err }));

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
        throw new Error('Error! Could not get sauces.');
      }
      sauces = sauces.map((sauce) => {
        sauce.imageUrl = `http://localhost:3000/uploads/${sauce.imageUrl}`;
        return sauce;
      });
      return res.status(200).json(sauces);
    })
    .catch((err) => res.status(500).json({ message: err.message }));
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
  if (!req.file) {
    res.status(400).json({ message: 'Error! No image provided.' });
    return;
  }
  const sauce = JSON.parse(req.body.sauce);
  sauce.imageUrl = req.file.filename;
  sauce.usersLiked = [];
  sauce.usersDisliked = [];
  sauce.likes = 0;
  sauce.dislikes = 0;

  Sauce.newSauce(sauce)
    .then((sauceDb) => {
      if (!sauceDb) {
        throw new Error('Error! Could not create sauce.');
      }
      return res.status(200).json({ message: 'Sauce created' });
    })
    .catch((err) => {
      unlinkAsync(path.join(__dirname, `../public/uploads/${sauce.imageUrl}`));
      res.status(500).json({ message: err.message });
    });
}

router.post('/', uploadImage, createSauce);

function isUserAuthorized(sauceUserId, req) {
  const decodedToken = decodeToken(req.headers.authorization);
  return decodedToken.id === sauceUserId;
}

async function editSauce(req, res) {
  let sauce = req.body;
  if (req.body.sauce) {
    sauce = JSON.parse(req.body.sauce);
    sauce.imageUrl = req.file.filename;
  }

  // get sauce from db
  const sauceDb = await Sauce.getSauce(req.params.id);
  if (!isUserAuthorized(sauceDb.userId, req)) {
    if (req.file) {
      unlinkAsync(path.join(__dirname, `../public/uploads/${req.file.filename}`));
    }
    return res.status(403).json({ message: 'Error! You are not authorized to edit this sauce.' });
  }
  const newImageUrl = sauce.imageUrl;

  // check if sauce has all required fields
  if (!sauce.name || !sauce.manufacturer || !sauce.description || !sauce.mainPepper || !sauce.heat) {
    if (req.file) {
      unlinkAsync(path.join(__dirname, `../public/uploads/${req.file.filename}`));
    }
    return res.status(400).json({ message: 'Error! Sauce is missing required fields.' });
  }

  // merge sauce from db with sauce from request
  sauce = {
    ...sauce,
    likes: sauceDb.likes,
    dislikes: sauceDb.dislikes,
    usersLiked: sauceDb.usersLiked,
    usersDisliked: sauceDb.usersDisliked,
  };

  return Sauce.editSauce(req.params.id, sauce)
    .then((oldSauce) => {
      if (!oldSauce) {
        throw new Error('Error! Could not edit sauce.');
      }
      if (newImageUrl !== undefined && newImageUrl !== oldSauce.imageUrl) {
        unlinkAsync(path.join(__dirname, `../public/uploads/${oldSauce.imageUrl}`));
      }
      return res.status(200).json({ message: 'Sauce edited' });
    })
    .catch((err) => {
      if (req.file) {
        unlinkAsync(path.join(__dirname, `../public/uploads/${req.file.filename}`));
      }
      res.status(500).json({ message: err.message });
    });
}

router.put('/:id', uploadImage, editSauce);

function deleteSauce(req, res) {
  Sauce.getSauce(req.params.id)
    .then((sauce) => {
      if (!sauce) {
        throw new Error('Error! Could not get sauce.');
      }
      if (!isUserAuthorized(sauce.userId, req)) {
        return res.status(403).json({ message: 'Error! You are not authorized to delete this sauce.' });
      }
      return Sauce.deleteSauce(req.params.id)
        .then(() => {
          unlinkAsync(path.join(__dirname, `../public/uploads/${sauce.imageUrl}`));
          return res.status(200).json({ message: 'Sauce deleted' });
        })
        .catch((err) => res.status(500).json({ message: err.message }));
    })
    .catch((err) => res.status(400).json({ message: err.message }));
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
        throw new Error('Error! Could not get sauce.');
      }

      if (req.body.like === 1) {
        if (userListContains(sauce.usersLiked, userId)) {
          throw new Error('Sauce already liked');
        }
        sauce = likeSauce(sauce, userId);
      } else if (req.body.like === -1) {
        if (userListContains(sauce.usersDisliked, userId)) {
          throw new Error('Sauce already disliked');
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
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
}

router.post('/:id/like', setLikes);

module.exports = router;
