const express = require('express');
const pfeRoutes = require('./pfeRoutes');

const router = express.Router();

router.use('/pfe', pfeRoutes);

module.exports = router;
