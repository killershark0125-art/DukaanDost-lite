const mongoose = require('mongoose');
const Review = require('../models/review');
const Order = require('../models/order');
const Product = require('../models/product');
const { analyzeSentiment } = require('../services/ai/sentimentService');

const updateAverageRating = async (productId) => {
  const result = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$product', avg: { $avg: '$rating' } } },
  ]);
  const average = result.length ? Math.round(result[0].avg * 10) / 10 : 0;
  await Product.findByIdAndUpdate(productId, { averageRating: average });
};

const createReview = async (req, res) => {
  try {
    const { productId, rating, text } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Review text is required' });
    }
    if (text.length > 1000) {
      return res.status(400).json({ message: 'Review is too long (max 1000 characters)' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const delivered = await Order.findOne({
      customer: req.user._id,
      status: 'Delivered',
      'items.product': productId,
    });
    if (!delivered) {
      return res
        .status(403)
        .json({ message: 'You can only review products from a delivered order' });
    }

    const already = await Review.findOne({ product: productId, customer: req.user._id });
    if (already) {
      return res.status(409).json({ message: 'You have already reviewed this product' });
    }

    const sentiment = await analyzeSentiment(text.trim());

    const review = await Review.create({
      product: productId,
      customer: req.user._id,
      rating,
      text: text.trim(),
      sentiment: sentiment || undefined,
    });

    await updateAverageRating(productId);

    const populated = await review.populate('customer', 'name');
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this product' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const reviews = await Review.find({ product: req.params.id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSentimentStats = async (req, res) => {
  try {
    const rows = await Review.aggregate([{ $group: { _id: '$sentiment', count: { $sum: 1 } } }]);
    const stats = { positive: 0, neutral: 0, negative: 0, unanalyzed: 0 };
    rows.forEach((r) => {
      if (r._id) {
        stats[r._id] = r.count;
      } else {
        stats.unanalyzed = r.count;
      }
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createReview, getProductReviews, getSentimentStats };