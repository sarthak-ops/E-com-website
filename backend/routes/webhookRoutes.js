const express = require("express");
const router = express.Router();

const {
  handleStripeWebhook,
} = require("../controllers/webhookController");

// express.raw is required so Stripe can verify the raw cryptographic signature
router.post(
  "/",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

module.exports = router;