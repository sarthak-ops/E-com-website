// backend/routes/stripeRoutes.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// 1. Initiate Connect Onboarding
router.post("/connect/onboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let accountId = user.stripeAccountId;

    // Create a new Express account if user doesn't have one
    if (!accountId) {
      const account = await stripe.v2.core.accounts.create({
        contact_email: user.email,
        display_name: user.name,
        dashboard: "express",
      
        identity: {
          country: "CA",
          entity_type: "individual",
        },
      
        configuration: {
          merchant: {
            capabilities: {
              card_payments: {
                requested: true,
              },
            },
          },
      
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: {
                  requested: true,
                },
              },
            },
          },
        },
      
        defaults: {
          currency: "cad",
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },
      
        include: [
          "configuration.merchant",
          "configuration.recipient",
        ],
      });
      accountId = account.id;
      user.stripeAccountId = accountId;
      await user.save();
    }

    // Create link to host Stripe onboarding
    const accountLink = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["merchant", "recipient"],
          refresh_url: "http://localhost:5173/my-listings",
          return_url: "http://localhost:3001/api/stripe/connect/verify?account_id=" + accountId,
        },
      },
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe Onboarding Error:", err);
    res.status(500).json({ msg: err.message });
  }
});

// 2. Return URL verification after Stripe onboarding
router.get("/connect/verify", async (req, res) => {
    try {
      const { account_id } = req.query;
  
      const account = await stripe.accounts.retrieve(account_id);
  
      const user = await User.findOne({
        stripeAccountId: account_id,
      });
  
      if (account.details_submitted && user) {
        user.stripeOnboardingComplete = true;
        await user.save();
      }
  
      res.redirect("http://localhost:5173/my-listings");
    } catch (err) {
      console.error("Verification error:", err);
      res.redirect("http://localhost:5173/my-listings?error=stripe");
    }
  });

// 3. Get connection status for current user
router.get("/connect/status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      connected: Boolean(user.stripeAccountId),
      onboardingComplete: user.stripeOnboardingComplete,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;