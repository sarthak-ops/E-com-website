const Stripe = require("stripe");
const Order = require("../models/Order");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        msg: "Order not found"
      });
    }

    // build stripe line items
    const line_items = order.items.map(item => ({
      price_data: {
        currency: "usd",

        product_data: {
          name: item.name
        },

        unit_amount: item.price * 100
      },

      quantity: item.quantity
    }));

    // create checkout session
    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      line_items,

      mode: "payment",

      success_url: "http://localhost:3000/success",

      cancel_url: "http://localhost:3000/cancel"
    });

    res.json({
      url: session.url
    });

  } catch (err) {
    res.status(500).json({
      msg: err.message
    });
  }
};