// backend/controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const numQuantity = Number(quantity);

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // 1. Check if product is in stock
    if (product.stock <= 0) {
      return res.status(400).json({ msg: "Product is out of stock" });
    }

    if (numQuantity < 1) {
      return res.status(400).json({ msg: "Quantity must be at least 1" });
    }

    let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart) {
      // Check requested quantity against stock
      if (numQuantity > product.stock) {
        return res.status(400).json({ msg: `Only ${product.stock} items available in stock` });
      }

      // Cart is empty -> create new cart with this item
      cart = new Cart({
        user: req.user.id,
        items: [
          {
            product: productId,
            quantity: numQuantity,
          },
        ],
      });
    } else if (cart.items.length === 0) {
      // Check requested quantity against stock
      if (numQuantity > product.stock) {
        return res.status(400).json({ msg: `Only ${product.stock} items available in stock` });
      }

      cart.items.push({
        product: productId,
        quantity: numQuantity,
      });
    } else {
      // Cart has existing items -> check seller match
      const existingSellerId = cart.items[0].product.createdBy.toString();
      const newSellerId = product.createdBy.toString();

      if (existingSellerId !== newSellerId) {
        return res.status(400).json({
          msg: "Your cart currently contains items from another seller. Multi-seller checkouts are not supported yet.",
        });
      }

      // Same seller -> check if item already exists in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.product._id.toString() === productId
      );

      if (itemIndex >= 0) {
        const combinedQuantity = cart.items[itemIndex].quantity + numQuantity;

        // 2. Enforce cumulative stock limit for existing items
        if (combinedQuantity > product.stock) {
          return res.status(400).json({
            msg: `Cannot add more. You have ${cart.items[itemIndex].quantity} in cart, and only ${product.stock} are available.`,
          });
        }

        cart.items[itemIndex].quantity = combinedQuantity;
      } else {
        if (numQuantity > product.stock) {
          return res.status(400).json({ msg: `Only ${product.stock} items available in stock` });
        }

        cart.items.push({
          product: productId,
          quantity: numQuantity,
        });
      }
    }

    await cart.save();
    
    // Return re-populated cart
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    res.json(updatedCart);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart) {
      return res.json(null);
    }

    // Remove cart items whose products no longer exist
    const validItems = cart.items.filter((item) => item.product !== null);

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    const numQuantity = Number(quantity);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Enforce stock upper boundary & positive lower boundary
    if (numQuantity < 1 || numQuantity > product.stock) {
      return res.status(400).json({
        msg: `Quantity must be between 1 and ${product.stock}.`,
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ msg: "Item not found in cart" });
    }

    item.quantity = numQuantity;

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate("items.product");

    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findOne({ user: userId }).populate("items.product");
    
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};