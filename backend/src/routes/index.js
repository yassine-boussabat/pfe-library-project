const express = require('express');
const pfeRoutes = require('./pfeRoutes');
const favoritesRoutes = require('./favoritesRoutes');

const router = express.Router();

router.use('/pfe', pfeRoutes);

router.use('/favorites', favoritesRoutes);

module.exports = router;
