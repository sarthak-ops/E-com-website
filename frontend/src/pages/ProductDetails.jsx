// src/pages/ProductDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to add items to your cart.");
      return;
    }

    try {
      setAdding(true);
      await axios.post(
        "http://localhost:3001/api/cart",
        { productId: product._id, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg("Added to cart!");
      setErrorMsg("");
    } catch (err) {
      console.error("Cart error:", err);
      const apiError = err.response?.data?.msg;

      setErrorMsg(apiError || "Failed to add item to cart.");
      setSuccessMsg("");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading details...</p>;
  if (!product) return <p style={{ textAlign: "center", marginTop: "40px" }}>Product not found.</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>
      <img
        src={product.image || "https://via.placeholder.com/300"}
        alt={product.name}
        style={{ width: "100%", maxHeight: "300px", objectFit: "cover", borderRadius: "8px" }}
      />
      <h2>{product.name}</h2>
      <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
        ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
      </p>
      <p>{product.description}</p>

      {/* Stock & Quantity Control Section */}
      <div style={{ marginTop: "20px" }}>
        <p style={{ fontWeight: "600" }}>
          {product.stock > 0
            ? `In stock: ${product.stock}`
            : "Out of stock"}
        </p>

        {product.stock > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <label style={{ fontWeight: "600" }}>Quantity:</label>

            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value >= 1 && value <= product.stock) {
                  setQuantity(value);
                }
              }}
              style={{
                width: "60px",
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              style={{
                backgroundColor:
                  adding || product.stock === 0 ? "#93c5fd" : "#2563eb",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor:
                  adding || product.stock === 0
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "600",
              }}
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        )}

        {errorMsg && (
          <p
            style={{
              color: "#dc2626",
              marginTop: "10px",
              fontSize: "0.9rem",
              fontWeight: "600",
            }}
          >
            {errorMsg}
          </p>
        )}

        {successMsg && (
          <p
            style={{
              color: "#16a34a",
              marginTop: "10px",
              fontSize: "0.9rem",
              fontWeight: "600",
            }}
          >
            {successMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;