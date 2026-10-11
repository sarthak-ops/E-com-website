// src/pages/Products.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Notification from "../components/Notification";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setNotification({
        message: "Please sign in to add items to your cart.",
        type: "error",
      });
      setTimeout(() => {
        setNotification(null);
        navigate("/signin");
      }, 1500);
      return;
    }

    setAddingId(productId);

    try {
      await axios.post(
        "http://localhost:3001/api/cart",
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotification({
        message: "Item added to cart!",
        type: "success",
      });

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setNotification({
        message: err.response?.data?.msg || "Failed to add item to cart.",
        type: "error",
      });

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading products...</p>;

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px", position: "relative" }}>
      {/* Toast Notification Container */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <h2>Marketplace Products</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px", marginTop: "20px" }}>
        {products.map((product) => (
          <div
            key={product._id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "15px",
              textAlign: "center",
              opacity: product.stock === 0 ? 0.55 : 1,
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <img
              src={product.image || "https://via.placeholder.com/150"}
              alt={product.name}
              style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "4px" }}
            />
            <h3 style={{ margin: "10px 0 5px 0" }}>{product.name}</h3>
            <p style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>
              ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
            </p>

            {/* Stock status indicator */}
            <p
              style={{
                fontWeight: "600",
                fontSize: "0.85rem",
                color: product.stock === 0 ? "#dc2626" : "#16a34a",
                margin: "0 0 12px 0",
              }}
            >
              {product.stock === 0
                ? "Out of Stock"
                : `${product.stock} in stock`}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link to={`/products/${product._id}`} style={{ textDecoration: "none", color: "#2563eb", fontWeight: "500" }}>
                View Details
              </Link>
              <button
                onClick={() => handleAddToCart(product._id)}
                disabled={addingId === product._id || product.stock === 0}
                style={{
                  backgroundColor:
                    product.stock === 0
                      ? "#9ca3af"
                      : addingId === product._id
                      ? "#93c5fd"
                      : "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  cursor:
                    product.stock === 0 || addingId === product._id
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "600",
                }}
              >
                {product.stock === 0
                  ? "Out of Stock"
                  : addingId === product._id
                  ? "Adding..."
                  : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;