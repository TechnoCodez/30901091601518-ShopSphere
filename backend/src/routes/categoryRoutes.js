const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getCategories);
router.post('/', protect, authorizeRoles('ADMIN'), createCategory);

module.exports = router;