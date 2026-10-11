const Product = require("../models/Product");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      image: req.file.path, // Cloudinary URL
      createdBy: req.user.id // Add this line
    });

    res.status(201).json(product);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const products = await Product.find({
      createdBy: req.user.id
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete a product listing
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Ensure the seller owns this product
    if (product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to delete this listing" });
    }

    await product.deleteOne();
    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET SINGLE PRODUCT
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};