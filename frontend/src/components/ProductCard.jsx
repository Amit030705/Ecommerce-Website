import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import fallbackImage from "../assets/product-fallback.svg";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import StarRating from "./StarRating";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const hasDiscount = product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAdding(true);
    setMessage("");
    try {
      await addToCart(product._id);
      setMessage("Added to bag");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not add to bag");
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-card-link" aria-label={`View ${product.name}`}>
        <div className="product-image-wrap">
          <img
            src={product.image || fallbackImage}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImage;
            }}
          />
          {(product.badge || discount > 0) && (
            <span className="product-badge">{product.badge || `${discount}% off`}</span>
          )}
        </div>
        <div className="product-card-body">
          <span className="product-card-brand">{product.brand || product.category}</span>
          <h3 className="product-card-name">{product.name}</h3>
          {product.numReviews > 0 && <StarRating rating={product.ratingsAverage} numReviews={product.numReviews} />}
          <div className="product-card-prices">
            <span className="product-card-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
            {hasDiscount && <span className="product-card-original">₹{Number(product.originalPrice).toLocaleString("en-IN")}</span>}
          </div>
        </div>
      </Link>
      <div className="product-card-actions">
        <button className="product-add-button" onClick={handleAdd} disabled={adding || product.stock < 1}>
          {product.stock < 1 ? "Sold out" : adding ? "Adding…" : "Add to bag"}
        </button>
        {message && <span className="product-action-message" role="status">{message}</span>}
      </div>
    </article>
  );
}
