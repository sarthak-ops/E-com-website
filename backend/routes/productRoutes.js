const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProduct,
  getMyListings,
  deleteProduct
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

router.post("/", authMiddleware, upload.single("image"), createProduct);

router.get("/", getProducts);

router.get("/my-listings", authMiddleware, getMyListings);

router.get("/:id", getProduct);

router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;