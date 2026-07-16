import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

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

      <ul className="cart-list">
        {items.map(({ product, quantity }) => (
          <li key={product._id} className="cart-item">
            <img src={product.image} alt={product.name} />

            <div className="cart-item-info">
              <Link to={`/product/${product._id}`}>{product.name}</Link>
              <p className="cart-item-price">₹{product.price.toLocaleString("en-IN")}</p>

              <div className="cart-item-qty">
                <button
                  onClick={() => updateQuantity(product._id, Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button onClick={() => updateQuantity(product._id, quantity + 1)}>+</button>
              </div>

              <button className="link-danger" onClick={() => removeFromCart(product._id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <h3>Order Summary</h3>
        <div className="cart-summary-row">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <p className="cart-summary-note">Payment method: Cash on Delivery</p>
        <button className="btn-primary" onClick={() => navigate("/checkout")}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
