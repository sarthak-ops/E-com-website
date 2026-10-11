// src/pages/Signup.jsx
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import "./Auth.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create account
      await axios.post("http://localhost:3001/api/auth/register", {
        email,
        password,
      });

      // 2. Automatically log the user in
      const loginRes = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      // 3. Store JWT token
      localStorage.setItem("token", loginRes.data.token);

      setNotification({
        message: "Account created! Logging you in...",
        type: "success",
      });

      // 4. Redirect to home page
      setTimeout(() => {
        setNotification(null);
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      setNotification({
        message:
          err.response?.data?.msg ||
          err.response?.data?.message ||
          "Signup failed. Please try again.",
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
          <h1>Create an account</h1>
          <p>Join the Marketplace community</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/signin">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;