const express = require('express');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.post('/', protect, authorize('customer'), createOrder);
router.get('/my', protect, authorize('customer'), getMyOrders);
router.get('/', protect, authorize('seller'), getAllOrders);
router.patch('/:id/status', protect, authorize('seller'), updateOrderStatus);
router.patch('/:id/cancel', protect, authorize('customer'), cancelOrder);

module.exports = router;