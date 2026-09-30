const Product = require('../models/product');

const validateProduct = (body) => {
  const { title, description, price, stock, category, images } = body;
  if (!title || !description || !category) {
    return 'Title, description and category are required';
  }
  if (!Array.isArray(images) || images.length === 0 || !images[0]) {
    return 'At least one image is required';
  }
  if (!(Number(price) > 0)) {
    return 'Price must be greater than 0';
  }
  if (!(Number(stock) >= 0)) {
    return 'Stock cannot be negative';
  }
  return null;
};

const getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product id' });
  }
};
const createProduct = async (req, res) => {
  try {
    const error = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }
    const { title, description, price, stock, category, images } = req.body;
    const product = await Product.create({ title, description, price, stock, category, images });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const error = validateProduct(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }
    const { title, description, price, stock, category, images } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { title, description, price, stock, category, images },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product id' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid product id' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };