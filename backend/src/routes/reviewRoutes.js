const express = require('express');
const { createReview, getSentimentStats } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.post('/', protect, authorize('customer'), createReview);
router.get('/stats', protect, authorize('seller'), getSentimentStats);

module.exports = router;