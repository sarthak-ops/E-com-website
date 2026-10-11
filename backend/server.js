require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("./middleware/authMiddleware");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

app.use("/api/webhooks/stripe", webhookRoutes);

// middleware
app.use(express.json());

app.use(cors());

// routes
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API running...");
});

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    msg: "Protected route accessed",
    user: req.user
  });
});

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/stripe", stripeRoutes);

// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// start server
app.listen(3001, () => {
  console.log("Server running on port 3001");
});