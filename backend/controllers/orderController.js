const Order = require("../models/Order");
const Cart = require("../models/Cart");

// CREATE ORDER (checkout)
exports.createOrder = async (req, res) => {
  try {

    // get user's cart
    const cart = await Cart.findOne({
      user: req.user.id
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        msg: "Cart is empty"
      });
    }

    // build order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    // calculate total
    const totalPrice = cart.items.reduce(
      (total, item) =>
        total + item.product.price * item.quantity,
      0
    );

    // create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalPrice
    });

    // clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (err) {
    res.status(500).json({
      msg: err.message
    });
  }
};

// GET USER ORDERS
exports.getOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      user: req.user.id
    });

    res.json(orders);

  } catch (err) {
    res.status(500).json({
      msg: err.message
    });
  }
};