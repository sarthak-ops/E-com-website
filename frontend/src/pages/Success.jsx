// src/pages/Success.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

function Success() {
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      if (!sessionId || !orderId) {
        if (!cancelled) {
          setStatus("error");
          setMessage("Missing payment information.");
        }
        return;
      }

      try {
        const token = localStorage.getItem("token");

        await axios.post(
          "http://localhost:3001/api/payments/verify-payment",
          {
            sessionId,
            orderId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          setStatus("success");
          setMessage("Payment successful! Your order has been placed.");
        }
      } catch (err) {
        console.error("Payment verification error:", err);

        if (!cancelled) {
          setStatus("error");
          setMessage(
            err.response?.data?.msg ||
              "Payment verification failed."
          );
        }
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [sessionId, orderId]);

  if (status === "verifying") {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h2>Verifying Payment...</h2>
        <p>Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h2>Payment Verification Failed</h2>
        <p>{message}</p>
        <Link to="/checkout">Return to Checkout</Link>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h2>Payment Successful! 🎉</h2>
      <p>{message}</p>

      <div style={{ marginTop: "20px" }}>
        <Link to="/orders">View My Orders</Link>
      </div>

      <div style={{ marginTop: "10px" }}>
        <Link to="/products">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default Success;