const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

const phoneRegex = /^03\d{9}$/;

const allowedTransitions = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

const restoreStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
};

const createOrder = async (req, res) => {
  const reserved = [];
  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const { name, phone, city, address } = shippingAddress || {};
    if (!name || !phone || !city || !address) {
      return res.status(400).json({ message: 'Name, phone, city and address are required' });
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone must be in format 03XXXXXXXXX' });
    }

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.product) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({ message: 'Invalid cart item' });
      }
    }

    const orderItems = [];
    let totalAmount = 0;
    let failure = null;

    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!product) {
        const existing = await Product.findById(item.product);
        failure = existing
          ? `Not enough stock for "${existing.title}"`
          : 'A product in your cart no longer exists';
        break;
      }

      reserved.push({ product: product._id, quantity: item.quantity });
      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;
    }

    if (failure) {
      await restoreStock(reserved);
      return res.status(400).json({ message: failure });
    }

    const order = await Order.create({
      orderNumber: `DD-${Date.now()}`,
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod: 'Cash on Delivery',
      shippingAddress: { name, phone, city, address },
    });

    res.status(201).json(order);
  } catch (error) {
    await restoreStock(reserved);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!Object.keys(allowedTransitions).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!allowedTransitions[order.status].includes(status)) {
      return res
        .status(400)
        .json({ message: `Cannot change status from ${order.status} to ${status}` });
    }

    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(409).json({ message: 'Order was just changed, please refresh' });
    }

    if (status === 'Cancelled') {
      await restoreStock(updated.items);
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order id' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id, status: 'Pending' },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!order) {
      const existing = await Order.findOne({ _id: req.params.id, customer: req.user._id });
      if (!existing) {
        return res.status(404).json({ message: 'Order not found' });
      }
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    await restoreStock(order.items);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order id' });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const [totalOrders, pendingOrders, sales] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      totalSales: sales.length ? sales[0].total : 0,
      totalOrders,
      pendingOrders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, cancelOrder, getOrderStats };