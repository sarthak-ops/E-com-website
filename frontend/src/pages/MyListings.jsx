// src/pages/MyListings.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function MyListings() {
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(token));

  const [stripeStatus, setStripeStatus] = useState({
    connected: false,
    onboardingComplete: false,
  });
  const [stripeLoading, setStripeLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchListings = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/products/my-listings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const fetchStripeStatus = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3001/api/stripe/connect/status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStripeStatus(res.data);
      } catch (err) {
        console.error("Failed to load Stripe status:", err);
      } finally {
        setStripeLoading(false);
      }
    };

    fetchStripeStatus();
  }, [token]);

  const handleStripeConnect = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3001/api/stripe/connect/onboard",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.location.href = res.data.url;
    } catch (err) {
      console.error("Stripe onboarding failed:", err);
      alert("Could not start Stripe onboarding.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      await axios.delete(`http://localhost:3001/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>Please sign in to view your listings</h2>
        <Link to="/signin">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading your listings...</p>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Listings</h2>
        <Link
          to="/create-product"
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "white",
            borderRadius: "4px",
            textDecoration: "none",
          }}
        >
          + Add New Listing
        </Link>
      </div>

      {!stripeLoading && (
        stripeStatus.onboardingComplete ? (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#dcfce7",
              color: "#15803d",
              borderRadius: "6px",
              marginTop: "20px",
            }}
          >
            ✓ Stripe Payouts Active
          </div>
        ) : (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#fef3c7",
              borderRadius: "6px",
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>Set Up Seller Payouts</strong>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "0.9rem",
                  color: "#92400e",
                }}
              >
                Connect your Stripe account to receive payments from buyers.
              </p>
            </div>

            <button
              onClick={handleStripeConnect}
              style={{
                padding: "8px 16px",
                backgroundColor: "#635bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Connect Stripe
            </button>
          </div>
        )
      )}

      {products.length === 0 ? (
        <div style={{ marginTop: "20px" }}>
          <p>You haven't listed any products yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
          {products.map((product) => (
            <div
              key={product._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "15px",
              }}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }}
                />
              )}

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 5px 0" }}>{product.name}</h3>
                <p style={{ margin: "0", color: "#4b5563" }}>Price: ${product.price.toFixed(2)}</p>
                {product.stock !== undefined && (
                  <p style={{ margin: "0", color: "#6b7280", fontSize: "0.9rem" }}>
                    Stock: {product.stock}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDelete(product._id)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyListings;