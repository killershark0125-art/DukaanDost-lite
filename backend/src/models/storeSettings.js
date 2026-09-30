const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  storeName: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  whatsappNumber: { type: String, required: true, trim: true },
  deliveryPolicy: { type: String, required: true, trim: true },
  faqs: [
    {
      question: { type: String, required: true, trim: true },
      answer: { type: String, required: true, trim: true },
    },
  ],
});

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);