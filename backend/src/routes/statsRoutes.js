const express = require('express');
const { getStoreStats } = require('../controllers/statsController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('ADMIN'), getStoreStats);

module.exports = router;