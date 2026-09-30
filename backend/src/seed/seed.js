require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user');

const seed = async () => {
  await connectDB();

  const email = process.env.SELLER_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log('Seller already exists, nothing to do');
  } else {
    const passwordHash = await bcrypt.hash(process.env.SELLER_PASSWORD, 10);
    await User.create({
      name: 'Store Owner',
      email,
      phone: '03001234567',
      passwordHash,
      role: 'seller',
    });
    console.log('Seller created:', email);
  }

  await mongoose.disconnect();
};

seed();