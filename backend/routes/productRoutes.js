const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");

// protected route
router.post("/", authMiddleware, createProduct);

// public route
router.get("/", getProducts);

module.exports = router;