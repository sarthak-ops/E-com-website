// backend/controllers/orderController.js
const Order = require("../models/Order");
const Cart = require("../models/Cart");

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Cart is empty" });
    }

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          msg: "A product in your cart no longer exists",
        });
      }
    
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          msg: `Not enough stock for "${item.product.name}". Available: ${item.product.stock}`,
        });
      }
    }
    
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      seller: item.product.createdBy,
      itemStatus: "Pending",
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      status: "Pending", // Starts as Pending
    });

    await order.save();
    // Cart is not cleared here 
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get logged-in user's orders (For Step 2)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get orders containing products sold by the logged-in seller
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.seller": req.user.id,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    res.status(500).json({ msg: err.message });
  }
};

// Update the status of an order (Seller action)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const sellerId = req.user.id;

    const validStatuses = ["Shipped", "Delivered"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        msg: "Invalid order status. Status must be 'Shipped' or 'Delivered'.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        msg: "Order not found",
      });
    }

    // Ensure the logged-in seller has at least one item in this order
    const sellerItems = order.items.filter(
      (item) => item.seller && item.seller.toString() === sellerId
    );

    if (sellerItems.length === 0) {
      return res.status(403).json({
        msg: "Unauthorized: You do not have items in this order",
      });
    }

    // State machine checks against current order status
    if (status === "Shipped" && order.status !== "Paid" && order.status !== "Shipped") {
      return res.status(400).json({
        msg: "Order must be Paid before it can be marked as Shipped",
      });
    }

    if (status === "Delivered" && order.status !== "Shipped") {
      return res.status(400).json({
        msg: "Order must be Shipped before it can be marked as Delivered",
      });
    }

    // Update item-level status for this specific seller's items
    order.items.forEach((item) => {
      if (item.seller && item.seller.toString() === sellerId) {
        item.itemStatus = status;
      }
    });

    // Update main order status
    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ msg: err.message });
  }
};