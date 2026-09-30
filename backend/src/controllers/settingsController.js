const StoreSettings = require('../models/storeSettings');

const defaultSettings = {
  storeName: 'DukaanDost',
  city: 'Islamabad',
  whatsappNumber: '03001234567',
  deliveryPolicy: 'Delivery in 3-5 working days. Cash on Delivery only.',
  faqs: [
    { question: 'Do you offer Cash on Delivery?', answer: 'Yes, Cash on Delivery is available on all orders.' },
    { question: 'How long does delivery take?', answer: 'Delivery takes 3-5 working days.' },
    { question: 'Can I cancel my order?', answer: 'Yes, you can cancel while the order is still Pending.' },
  ],
};

const getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create(defaultSettings);
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { storeName, city, whatsappNumber, deliveryPolicy, faqs } = req.body;

    if (!storeName || !city || !whatsappNumber || !deliveryPolicy) {
      return res.status(400).json({ message: 'Store name, city, WhatsApp number and delivery policy are required' });
    }
    if (!/^\+?\d{10,15}$/.test(whatsappNumber)) {
      return res.status(400).json({ message: 'WhatsApp number must be 10-15 digits' });
    }
    if (!Array.isArray(faqs) || faqs.length < 3) {
      return res.status(400).json({ message: 'At least 3 FAQs are required' });
    }
    if (faqs.some((f) => !f.question || !f.answer)) {
      return res.status(400).json({ message: 'Every FAQ needs a question and an answer' });
    }

    const settings = await StoreSettings.findOneAndUpdate(
      {},
      { storeName, city, whatsappNumber, deliveryPolicy, faqs },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSettings, updateSettings };