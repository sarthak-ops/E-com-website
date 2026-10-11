// src/pages/Signin.jsx
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import "./Auth.css";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);

      setNotification({
        message: "Login successful! Redirecting...",
        type: "success",
      });

      setTimeout(() => {
        setNotification(null);
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      setNotification({
        message: err.response?.data?.msg || err.response?.data?.message || "Login failed. Please check your credentials.",
        type: "error",
      });

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🛒</div>
          <h1>Welcome back</h1>
          <p>Sign in to your Marketplace account</p>
        </div>

        <form onSubmit={handleSignin} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default Signin;