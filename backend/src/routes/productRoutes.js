const express = require('express');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorizeRoles('ADMIN'), upload.single('image'), createProduct);
router.put('/:id', protect, authorizeRoles('ADMIN'), upload.single('image'), updateProduct);
router.delete('/:id', protect, authorizeRoles('ADMIN'), deleteProduct);

module.exports = router;