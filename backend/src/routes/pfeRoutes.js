const express = require('express');
const router = express.Router();
const pfeController = require('../controllers/pfeController');

router.post('/sync', pfeController.syncFromGoogleDrive);
router.get('/books', pfeController.getAllBooks);
router.get('/filters', pfeController.getFilters);
router.get('/books/:id', pfeController.getBookById);
router.post('/fix-thumbnails', pfeController.fixThumbnails);

module.exports = router;
