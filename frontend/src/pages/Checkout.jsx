// src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Checkout() {
  const [cart, setCart] = useState(null);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(() => Boolean(token));
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Canada",
  });

  useEffect(() => {
    if (!token) return;

    const fetchCart = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data);
      } catch (err) {
        console.error("Error fetching cart for checkout:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  const handleCheckoutFlow = async () => {
    setProcessing(true);

    try {
      // 1. Create order with shipping address
      const orderRes = await axios.post(
        "http://localhost:3001/api/orders",
        { shippingAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderId = orderRes.data._id;

      // 2. Create Stripe checkout session
      const paymentRes = await axios.post(
        "http://localhost:3001/api/payments/create-checkout-session",
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3. Redirect to Stripe
      if (paymentRes.data.url) {
        window.location.href = paymentRes.data.url;
      }
    } catch (err) {
      console.error("Checkout flow error:", err);
      alert(
        err.response?.data?.msg || "Failed to initiate payment process."
      );
      setProcessing(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>Please sign in to view checkout</h2>
        <Link to="/signin">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        Loading cart details...
      </p>
    );
  }

  const items = cart?.items || [];
  const totalPrice = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "0 20px",
      }}
    >
      <h2>Checkout & Order Summary</h2>

      {items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/products">Browse Products</Link>
        </div>
      ) : (
        <div>
          {/* Shipping Address */}
          <div style={{ marginTop: "20px" }}>
            <h3>Shipping Address</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={shippingAddress.fullName}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  fullName: e.target.value,
                })
              }
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Street Address"
              value={shippingAddress.street}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  street: e.target.value,
                })
              }
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="City"
              value={shippingAddress.city}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  city: e.target.value,
                })
              }
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Province"
              value={shippingAddress.province}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  province: e.target.value,
                })
              }
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={shippingAddress.postalCode}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  postalCode: e.target.value,
                })
              }
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Country"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          {/* Order Summary */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "20px",
              marginTop: "20px",
            }}
          >
            {items.map((item) => (
              <div
                key={item.product._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <strong>{item.product.name}</strong> × {item.quantity}
                </div>
                <div>$ {(item.product.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              <span>Total Amount:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Stripe Checkout */}
          <button
            onClick={handleCheckoutFlow}
            disabled={processing}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              backgroundColor: processing ? "#9ca3af" : "#635bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1.1rem",
              fontWeight: "600",
              cursor: processing ? "not-allowed" : "pointer",
            }}
          >
            {processing ? "Processing Order..." : "Proceed to Pay with Stripe"}
          </button>
        </div>
      )}
    </div>
  );
}

// Input styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "6px 0 12px 0",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  fontSize: "1rem",
  boxSizing: "border-box",
};

export default Checkout;