// frontend/src/pages/SellerOrders.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function SellerOrders() {
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(token));
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchSellerOrders = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/orders/seller", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching seller orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [token]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrder(orderId);

      const res = await axios.patch(
        `http://localhost:3001/api/orders/${orderId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Replace the old order with the updated one from backend
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === orderId ? res.data : order))
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(
        err.response?.data?.msg || "Failed to update order status. Please try again."
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>Please sign in to view your seller orders</h2>
        <Link to="/signin">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        Loading seller orders...
      </p>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
      <h2>Seller Orders</h2>

      {orders.length === 0 ? (
        <div style={{ marginTop: "20px" }}>
          <p>No orders for your products yet.</p>
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
            {/* Header */}
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
                      : order.status === "Delivered"
                      ? "#e0e7ff"
                      : "#fef3c7",
                  color:
                    order.status === "Paid"
                      ? "#15803d"
                      : order.status === "Shipped"
                      ? "#1d4ed8"
                      : order.status === "Delivered"
                      ? "#4338ca"
                      : "#b45309",
                }}
              >
                {order.status}
              </span>
            </div>

            {/* Buyer Info */}
            {order.user && (
              <div style={{ marginTop: "15px" }}>
                <h4 style={{ margin: "0 0 5px 0" }}>Buyer</h4>
                <p style={{ margin: 0, color: "#4b5563" }}>
                  {order.user.name} ({order.user.email})
                </p>
              </div>
            )}

            {/* Items */}
            <h4 style={{ marginTop: "15px", marginBottom: "8px" }}>Items</h4>

            {order.items?.map((item, index) => (
              <div
                key={item._id || index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div>
                  <span style={{ fontWeight: "500" }}>
                    {item.name || item.product?.name || "Product"} × {item.quantity}
                  </span>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280",
                      marginTop: "2px",
                    }}
                  >
                    Item status: {item.itemStatus || order.status}
                  </div>
                </div>

                <span>
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Total Amount */}
            <p style={{ fontWeight: "600", marginTop: "15px", textAlign: "right" }}>
              Order Total: ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
            </p>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div style={{ marginTop: "15px" }}>
                <h4 style={{ marginBottom: "8px" }}>Shipping Address</h4>
                <p style={{ margin: 0, color: "#4b5563", lineHeight: "1.4" }}>
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: "20px" }}>
              {order.status === "Paid" && (
                <button
                  onClick={() => updateOrderStatus(order._id, "Shipped")}
                  disabled={updatingOrder === order._id}
                  style={{
                    padding: "10px 16px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: updatingOrder === order._id ? "not-allowed" : "pointer",
                    backgroundColor: "#2563eb",
                    color: "white",
                    fontWeight: "600",
                    opacity: updatingOrder === order._id ? 0.7 : 1,
                  }}
                >
                  {updatingOrder === order._id ? "Updating..." : "Mark as Shipped"}
                </button>
              )}

              {order.status === "Shipped" && (
                <button
                  onClick={() => updateOrderStatus(order._id, "Delivered")}
                  disabled={updatingOrder === order._id}
                  style={{
                    padding: "10px 16px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: updatingOrder === order._id ? "not-allowed" : "pointer",
                    backgroundColor: "#16a34a",
                    color: "white",
                    fontWeight: "600",
                    opacity: updatingOrder === order._id ? 0.7 : 1,
                  }}
                >
                  {updatingOrder === order._id ? "Updating..." : "Mark as Delivered"}
                </button>
              )}

              {order.status === "Delivered" && (
                <p style={{ margin: 0, color: "#15803d", fontWeight: "600" }}>
                  ✓ Order delivered
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SellerOrders;