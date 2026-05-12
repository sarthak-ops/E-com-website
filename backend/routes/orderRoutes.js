const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

// checkout
router.post("/", authMiddleware, createOrder);

// get user orders
router.get("/", authMiddleware, getOrders);

module.exports = router;