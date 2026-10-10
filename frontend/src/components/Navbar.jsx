import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/products/categories")
      .then(({ data }) => {
        if (active) setCategories(data.slice(0, 5));
      })
      .catch(() => {
        if (active) setCategoryError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/?keyword=${encodeURIComponent(query)}#catalog` : "/#catalog");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="navbar">
        <Link to="/" className="navbar-logo" aria-label="ShopKart home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>shopkart<span className="brand-period">.</span></span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch} role="search">
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
          <input
            type="search"
            aria-label="Search products"
            placeholder="Search products, brands and more"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <nav className="navbar-links" aria-label="Main navigation">
          {user?.role === "seller" && <Link to="/seller/dashboard" className="nav-dashboard">My store</Link>}
          {user?.role === "buyer" && <Link to="/orders" className="nav-dashboard">My orders</Link>}
          {user ? (
            <div className="navbar-user">
              <span className="user-greeting">Hi, {user.name.split(" ")[0]}</span>
              <button onClick={handleLogout}>Sign out</button>
            </div>
          ) : (
            <Link to="/login" className="account-link"><span aria-hidden="true">♙</span> Account</Link>
          )}
          <Link to="/cart" className="navbar-cart" aria-label={`Shopping bag, ${cartCount} items`}>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>
            <span className="cart-label">Bag</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </nav>
      </div>
      <nav className="category-nav" aria-label="Shop categories">
        <Link to="/#catalog">Shop all</Link>
        {categories.map((category) => (
          <Link key={category} to={`/?category=${encodeURIComponent(category)}#catalog`}>{category}</Link>
        ))}
        {categoryError && <span className="nav-category-error" role="status">Categories unavailable</span>}
        <Link to="/#featured-heading">Featured</Link>
      </nav>
    </header>
  );
}
