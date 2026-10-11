// backend/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: { type: String, default: "" },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  stripeAccountId: { type: String, default: "" },

  stripeOnboardingComplete: { type: Boolean, default: false },

});

module.exports = mongoose.model("User", userSchema);