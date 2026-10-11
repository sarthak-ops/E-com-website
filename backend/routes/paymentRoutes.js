const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  verifyPayment,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/create-checkout-session",
  authMiddleware,
  createCheckoutSession
);

router.post(
  "/verify-payment",
  authMiddleware,
  verifyPayment
);

module.exports = router;