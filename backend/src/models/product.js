const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: [1, 'Price must be greater than 0'] },
  stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'] },
  category: { type: String, required: true, trim: true },
  images: {
    type: [String],
    validate: [(arr) => arr.length > 0, 'At least one image is required'],
  },
  averageRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);