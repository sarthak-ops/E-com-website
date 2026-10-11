// backend/controllers/webhookController.js

const Stripe = require("stripe");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handleStripeWebhook = async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Stripe webhook received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Find order by Stripe Session ID
      const order = await Order.findOne({
        stripeSessionId: session.id,
      });

      if (!order) {
        console.error("Order not found for Stripe session:", session.id);
        return res.json({ received: true });
      }

      // Prevent processing the same payment twice (idempotency)
      if (order.status === "Paid") {
        return res.json({ received: true });
      }

      // Make sure Stripe actually reports the payment as paid
      if (session.payment_status === "paid") {
        // 1. Decrement inventory only if enough stock is still available
        for (const item of order.items) {
          const updatedProduct = await Product.findOneAndUpdate(
            {
              _id: item.product,
              stock: { $gte: item.quantity },
            },
            {
              $inc: { stock: -item.quantity },
            },
            { new: true }
          );

          if (!updatedProduct) {
            console.error(
              `Insufficient stock for product ${item.product} in order ${order._id}`
            );

            // Abort without changing order status if inventory cannot fulfill it
            return res.status(400).json({
              msg: "Insufficient stock for one or more products",
            });
          }
        }

        // 2. Payment and inventory confirmed -> update order status to Paid
        order.status = "Paid";
        order.items.forEach((item) => {
          item.itemStatus = "Paid";
        });

        await order.save();

        // 3. Clear buyer's cart after successful payment and stock update
        await Cart.findOneAndUpdate(
          { user: order.user },
          { $set: { items: [] } }
        );

        console.log(`Order ${order._id} marked as Paid & stock updated.`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    res.status(500).json({ msg: err.message });
  }
};