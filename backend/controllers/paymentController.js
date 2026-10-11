// backend/controllers/paymentController.js
const Stripe = require("stripe");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Make sure this order belongs to the logged-in buyer
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // Since we currently only allow one seller per cart,
    // every item should belong to the same seller.
    const sellerId = order.items[0]?.seller;

    if (!sellerId) {
      return res.status(400).json({ msg: "Seller not found" });
    }

    const seller = await User.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ msg: "Seller not found" });
    }

    if (!seller.stripeAccountId || !seller.stripeOnboardingComplete) {
      return res.status(400).json({
        msg: "Seller has not completed Stripe setup",
      });
    }

    // Make sure all items belong to the same seller
    const multipleSellers = order.items.some(
      (item) => item.seller.toString() !== sellerId.toString()
    );

    if (multipleSellers) {
      return res.status(400).json({
        msg: "Multi-seller checkout is not supported",
      });
    }

    const line_items = order.items.map((item) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    console.log("Creating Stripe checkout for order:", order._id);
    console.log("Seller Stripe account:", seller.stripeAccountId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items,

      mode: "payment",

      payment_intent_data: {
        transfer_data: {
          destination: seller.stripeAccountId,
        },
      },

      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,

      cancel_url: `http://localhost:5173/checkout`,
    });

    console.log("Stripe checkout session created:", session.id);

    order.stripeSessionId = session.id;

    await order.save();

    res.json({ url: session.url });
  } catch (err) {
    console.error("Create Checkout Session Error:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    if (order.stripeSessionId !== session.id) {
      return res.status(400).json({ msg: "Invalid payment session" });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        msg: "Payment not completed",
      });
    }

    // Already processed
    if (order.status === "Paid") {
      return res.json({
        success: true,
        order,
      });
    }

    order.status = "Paid";

    await order.save();

    // Clear buyer's cart only after successful payment
    await Cart.findOneAndUpdate(
      { user: order.user },
      { $set: { items: [] } }
    );

    res.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ msg: err.message });
  }
};