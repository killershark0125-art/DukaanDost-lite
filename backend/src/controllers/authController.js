const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const specialCharRegex = /[^A-Za-z0-9]/;
const phoneRegex = /^03\d{9}$/;
const allowedDomains = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
];

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    const domain = email.toLowerCase().split('@')[1];
    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({ message: 'Please use a Gmail, Outlook, Yahoo or iCloud email' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!specialCharRegex.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one special character' });
    }
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone must be in format 03XXXXXXXXX' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, phone, passwordHash });

    res.status(201).json({
      message: 'Registered successfully',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { register, login };