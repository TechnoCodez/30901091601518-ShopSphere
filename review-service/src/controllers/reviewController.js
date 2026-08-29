const Review = require('../models/Review');

const getReviewsForProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createReview = async (req, res) => {
  try {
    const { rating, comment, userId, userName } = req.body;
    const { productId } = req.params;

    if (!rating || !comment || !userId || !userName) {
      return res.status(400).json({ message: 'rating, comment, userId, and userName are required' });
    }

    const review = await Review.create({
      productId,
      userId,
      userName,
      rating: Number(rating),
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getReviewsForProduct, createReview };