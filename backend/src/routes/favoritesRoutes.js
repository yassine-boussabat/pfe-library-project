const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');

router.get('/', favoritesController.getFavorites);

router.post('/add', favoritesController.addFavorite);

router.delete('/remove/:bookId', favoritesController.removeFavorite);

router.get('/check/:bookId', favoritesController.checkFavorite);

router.get('/count/:bookId', favoritesController.getFavoritesCount);

module.exports = router;
