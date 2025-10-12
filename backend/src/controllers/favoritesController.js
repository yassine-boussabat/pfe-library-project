const Favorite = require('../models/Favorite');
const PFEBook = require('../models/PFEBook');

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    const favorites = await Favorite.find({ userId }).populate('bookId');
    const validFavorites = favorites.filter(fav => fav.bookId !== null);
    res.json(validFavorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { bookId, userId = 'default_user' } = req.body;
    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }
    const bookExists = await PFEBook.findById(bookId);
    if (!bookExists) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const existingFavorite = await Favorite.findOne({ userId, bookId });
    if (existingFavorite) {
      return res.status(200).json({ message: 'Book already in favorites', favorite: existingFavorite });
    }
    const favorite = new Favorite({ userId, bookId });
    await favorite.save();
    const populatedFavorite = await Favorite.findById(favorite._id).populate('bookId');
    res.status(201).json({ message: 'Book added to favorites', favorite: populatedFavorite });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.query.userId || 'default_user';
    const result = await Favorite.deleteOne({ userId, bookId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.json({ message: 'Book removed from favorites', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.query.userId || 'default_user';
    const favorite = await Favorite.findOne({ userId, bookId });
    res.json({ isFavorite: !!favorite, favorite: favorite || null });
  } catch (error) {
    res.status(500).json({ message: 'Error checking favorite', error: error.message });
  }
};

exports.getFavoritesCount = async (req, res) => {
  try {
    const { bookId } = req.params;
    const count = await Favorite.countDocuments({ bookId });
    res.json({ bookId, favoritesCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error counting favorites', error: error.message });
  }
};
