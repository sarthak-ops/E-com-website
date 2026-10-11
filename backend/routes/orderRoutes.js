const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getMyOrders);
router.get("/seller", authMiddleware, getSellerOrders);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;