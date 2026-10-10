import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import fallbackImage from "../assets/product-fallback.svg";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const items = (cart.items || []).filter((item) => item.product);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const updateItem = async (productId, quantity) => {
    setError("");
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update your bag.");
    }
  };

  const removeItem = async (productId) => {
    setError("");
    try {
      await removeFromCart(productId);
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove this item.");
    }
  };

  if (loading) return <p className="page-loading">Loading cart...</p>;

  if (items.length === 0) {
    return (
      <div className="empty-cart">
        <p>Your cart is empty.</p>
        <Link to="/" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>My Cart ({items.length})</h2>
      {error && <p className="form-error" role="alert">{error}</p>}

      <ul className="cart-list">
        {items.map(({ product, quantity }) => (
          <li key={product._id} className="cart-item">
            <img
              src={product.image || fallbackImage}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackImage;
              }}
            />

            <div className="cart-item-info">
              <Link to={`/product/${product._id}`}>{product.name}</Link>
              <p className="cart-item-price">₹{product.price.toLocaleString("en-IN")} <span>each</span></p>

              <div className="cart-item-qty">
                <button
                  aria-label={`Decrease quantity of ${product.name}`}
                  onClick={() => updateItem(product._id, Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  aria-label={`Increase quantity of ${product.name}`}
                  onClick={() => updateItem(product._id, quantity + 1)}
                  disabled={quantity >= product.stock}
                >+</button>
              </div>

              <button className="link-danger" onClick={() => removeItem(product._id)}>
                Remove
              </button>
            </div>
            <strong className="cart-line-total">₹{(product.price * quantity).toLocaleString("en-IN")}</strong>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <h3>Order Summary</h3>
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <div className="cart-summary-row cart-summary-shipping">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <p className="cart-summary-note">Payment method: Cash on Delivery</p>
        <button className="btn-primary" onClick={() => navigate("/checkout")}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
