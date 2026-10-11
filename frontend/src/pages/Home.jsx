// src/pages/Home.jsx
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-hero">
          <div className="home-icon">🛒</div>
          <h1>Welcome to Marketplace</h1>
          <p>
            Buy and sell products easily with our secure, peer-to-peer marketplace.
          </p>
        </div>

        <div className="home-actions">
          {isAuthenticated ? (
            <div className="home-auth-banner">
              <p>You're signed in!</p>
              <Link to="/products" className="home-primary-button">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <>
              <Link to="/signup" className="home-primary-button">
                Create an Account
              </Link>

              <div className="home-signin">
                <span>Already have an account?</span>
                <Link to="/signin" className="home-signin-link">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;