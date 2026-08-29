const express = require('express');
const { getReviewsForProduct, createReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/:productId', getReviewsForProduct);
router.post('/:productId', createReview);

module.exports = router;