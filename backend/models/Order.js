const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },

      name: String,

      price: Number,

      quantity: Number
    }
  ],

  totalPrice: {
    type: Number,
    required: true
  },

  isPaid: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);