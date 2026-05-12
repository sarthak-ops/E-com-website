const express = require("express");
const router = express.Router();

const {
    addToCart,
    getCart
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addToCart);

router.get("/", authMiddleware, getCart);

module.exports = router;