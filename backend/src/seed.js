require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/user');
const Product = require('./models/product');
const Order = require('./models/order');
const Review = require('./models/review');
const StoreSettings = require('./models/storeSettings');

const img = (name) => `https://picsum.photos/seed/${name}/600/600`;

const settingsData = {
  storeName: 'DukaanDost',
  city: 'Lahore',
  whatsappNumber: '03001234567',
  deliveryPolicy:
    'Free delivery on orders above Rs. 5000. Delivery takes 2-3 working days in Lahore, Karachi and Islamabad, and 4-6 days in other cities. Cash on Delivery only.',
  faqs: [
    { question: 'Do you offer Cash on Delivery?', answer: 'Yes, Cash on Delivery is available on all orders.' },
    { question: 'How long does delivery take?', answer: '2-3 working days in major cities and 4-6 days elsewhere in Pakistan.' },
    { question: 'Can I cancel my order?', answer: 'Yes, you can cancel your order while it is still Pending.' },
    { question: 'Can I return a product?', answer: 'Please contact us on WhatsApp within 3 days of delivery for returns.' },
  ],
};

const productData = [
  { title: 'Embroidered Lawn 3-Piece Suit', description: 'Soft summer lawn suit with embroidered shirt, printed dupatta and plain trouser.', price: 4500, stock: 15, category: 'Lawn Suits', images: [img('lawn-suit')] },
  { title: 'Red Cotton Kurta', description: 'Comfortable red cotton kurta, perfect for daily wear and Eid.', price: 2500, stock: 20, category: 'Kurtas', images: [img('red-kurta')] },
  { title: 'Chikankari White Kurta', description: 'Hand-embroidered white chikankari kurta with a straight cut.', price: 3200, stock: 12, category: 'Kurtas', images: [img('white-kurta')] },
  { title: 'Glass Bangles Set (12 pcs)', description: 'Colorful glass bangles set, 12 pieces, sizes 2.4 to 2.8.', price: 800, stock: 40, category: 'Bangles and Jewelry', images: [img('glass-bangles')] },
  { title: 'Kundan Jhumka Earrings', description: 'Traditional gold-tone kundan jhumkas for weddings and festive events.', price: 1500, stock: 25, category: 'Bangles and Jewelry', images: [img('jhumka')] },
  { title: 'Homemade Mango Achaar (500g)', description: 'Traditional homemade raw mango pickle made with mustard oil and fresh spices.', price: 650, stock: 30, category: 'Homemade Food', images: [img('mango-achaar')] },
  { title: 'Homemade Mixed Vegetable Achaar (500g)', description: 'Spicy mixed vegetable pickle with carrots, turnips and green chilies.', price: 600, stock: 30, category: 'Homemade Food', images: [img('veg-achaar')] },
  { title: 'Pure Pashmina Shawl', description: 'Warm and soft pashmina shawl with a fine woven border.', price: 5500, stock: 8, category: 'Shawls', images: [img('pashmina-shawl')] },
  { title: 'Handmade Leather Khussa', description: 'Handcrafted leather khussa with traditional embroidery, sizes 36 to 42.', price: 2800, stock: 18, category: 'Footwear', images: [img('khussa')] },
];

const makeOrder = (orderNumber, customerId, products, picks, status) => {
  const items = picks.map(([index, quantity]) => ({
    product: products[index]._id,
    title: products[index].title,
    price: products[index].price,
    quantity,
  }));
  return {
    orderNumber,
    customer: customerId,
    items,
    totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    paymentMethod: 'Cash on Delivery',
    shippingAddress: {
      name: 'Test Customer',
      phone: '03111234567',
      city: 'Lahore',
      address: 'House 12, Street 5, Model Town',
    },
    status,
  };
};

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany(),
      StoreSettings.deleteMany(),
    ]);

    const passwordHash = await bcrypt.hash('Test@1234', 10);
    const users = await User.create([
      { name: 'Store Owner', email: 'seller@test.com', phone: '03001234567', passwordHash, role: 'seller' },
      { name: 'Test Customer', email: 'customer@test.com', phone: '03111234567', passwordHash, role: 'customer' },
    ]);
    const customer = users[1];

    await StoreSettings.create(settingsData);
    const products = await Product.insertMany(productData);

    const orders = [
      makeOrder('DD-SEED-1001', customer._id, products, [[1, 1], [3, 2]], 'Delivered'),
      makeOrder('DD-SEED-1002', customer._id, products, [[5, 1]], 'Pending'),
    ];
    await Order.create(orders);

    for (const order of orders) {
      for (const item of order.items) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
      }
    }

    console.log('Seed complete:');
    console.log('  seller   -> seller@test.com / Test@1234');
    console.log('  customer -> customer@test.com / Test@1234');
    console.log(`  ${products.length} products, 2 orders (1 Delivered, 1 Pending), store settings with ${settingsData.faqs.length} FAQs`);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();