// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        🛒 Marketplace
      </Link>

      <div className="navbar-links">
        <Link to="/products" className="navbar-link">
          Browse Products
        </Link>
        
        {token ? (
          <>
            <Link to="/cart" className="navbar-link">
              Cart
            </Link>
            <Link to="/orders" className="navbar-link">
              My Orders
            </Link>
            <Link to="/my-listings" className="navbar-link">
              My Listings
            </Link>
            <Link to="/seller-orders" className="navbar-link">
              Seller Orders
            </Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className="navbar-link">
              Sign In
            </Link>
            <Link to="/signup" className="navbar-link">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;