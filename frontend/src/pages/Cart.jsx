// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Cart() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Initialize loading to false if no token exists, true if token exists
  const [loading, setLoading] = useState(() => Boolean(token));

  useEffect(() => {
    if (!token) return;

    const fetchCart = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data);
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await axios.put(
        "http://localhost:3001/api/cart",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data);
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const res = await axios.delete(
        `http://localhost:3001/api/cart/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data);
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>Please sign in to view your cart</h2>
        <Link to="/signin">Sign In</Link>
      </div>
    );
  }

  if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading cart...</p>;

  const items = cart?.items || [];
  const totalPrice = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
      <h2>Your Shopping Cart</h2>

      {items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/products">Browse Products</Link>
        </div>
      ) : (
        <div>
          {items.map((item) => (
            <div
              key={item.product._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e5e7eb",
                padding: "15px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <img
                  src={item.product.image || "https://via.placeholder.com/80"}
                  alt={item.product.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <div>
                  <h4 style={{ margin: "0 0 5px 0" }}>{item.product.name}</h4>
                  <p style={{ margin: 0 }}>${item.product.price}</p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.product._id,
                      item.quantity + 1
                    )
                  }
                  disabled={item.quantity >= item.product.stock}
                >
                  +
                </button>
              </div>

              <div>
                <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemoveItem(item.product._id)}
                  style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "30px", textAlign: "right" }}>
            <h3>Total: ${totalPrice.toFixed(2)}</h3>
            <button
              onClick={() => navigate("/checkout")}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                border: "none",
                padding: "10px 20px",
                fontSize: "1rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;