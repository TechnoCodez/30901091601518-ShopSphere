const express = require('express');
const { getReviewsForProduct, createReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:productId', getReviewsForProduct);
router.post('/:productId', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;