// src/pages/MyOrders.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function MyOrders() {
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(token));

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>Please sign in to view your orders</h2>
        <Link to="/signin">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        Loading orders...
      </p>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "0 20px",
      }}
    >
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <div>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products">Browse Products</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "20px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>Order #{order._id.slice(-6)}</strong>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  backgroundColor:
                    order.status === "Paid"
                      ? "#dcfce7"
                      : order.status === "Shipped"
                      ? "#dbeafe"
                      : "#fef3c7",
                  color:
                    order.status === "Paid"
                      ? "#15803d"
                      : order.status === "Shipped"
                      ? "#1d4ed8"
                      : "#b45309",
                }}
              >
                {order.status}
              </span>
            </div>

            <p style={{ fontWeight: "600", marginTop: "10px" }}>
              Total: ${order.totalAmount.toFixed(2)}
            </p>

            <h4 style={{ marginTop: "15px", marginBottom: "8px" }}>Items</h4>

            {order.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span>
                  {item.name} × {item.quantity}
                </span>

                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <h4 style={{ marginTop: "15px", marginBottom: "8px" }}>
              Shipping Address
            </h4>

            <p style={{ color: "#4b5563", lineHeight: "1.4" }}>
              {order.shippingAddress?.fullName}
              <br />
              {order.shippingAddress?.street}
              <br />
              {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.province}
              <br />
              {order.shippingAddress?.postalCode}
              <br />
              {order.shippingAddress?.country}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;