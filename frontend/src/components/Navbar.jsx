import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/?keyword=${encodeURIComponent(search.trim())}` : "/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        ShopKart
      </Link>

      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for products, brands and more"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <nav className="navbar-links">
        {user?.role === "seller" && <Link to="/seller/dashboard">Seller Dashboard</Link>}
        {user?.role === "buyer" && <Link to="/orders">My Orders</Link>}

        <Link to="/cart" className="navbar-cart">
          Cart{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <div className="navbar-user">
            <span>Hi, {user.name.split(" ")[0]}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
