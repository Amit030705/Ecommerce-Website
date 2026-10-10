import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    phone: user?.phone || "",
  });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const items = cart.items || [];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!address.street.trim() || !address.city.trim() || !address.pincode.trim()) {
      setError("Street, city and pincode are required");
      return;
    }

    setPlacing(true);
    try {
      const { data: order } = await api.post("/orders", { shippingAddress: address });
      await refreshCart();
      navigate("/orders", { state: { justPlacedOrderId: order._id } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return <p>Your cart is empty. Add some products before checking out.</p>;
  }

  return (
    <div className="checkout-page">
      <form className="checkout-form" onSubmit={handlePlaceOrder}>
        <span className="eyebrow">ALMOST YOURS</span>
        <h2>Delivery details</h2>
        {error && <p className="form-error">{error}</p>}

        <label>
          Street address
          <input type="text" name="street" value={address.street} onChange={handleChange} autoComplete="street-address" required />
        </label>

        <div className="form-row">
          <label>
            City
            <input type="text" name="city" value={address.city} onChange={handleChange} autoComplete="address-level2" required />
          </label>
          <label>
            State
            <input type="text" name="state" value={address.state} onChange={handleChange} autoComplete="address-level1" />
          </label>
        </div>

        <div className="form-row">
          <label>
            Pincode
            <input type="text" name="pincode" value={address.pincode} onChange={handleChange} autoComplete="postal-code" required />
          </label>
          <label>
            Phone
            <input type="tel" name="phone" value={address.phone} onChange={handleChange} autoComplete="tel" />
          </label>
        </div>

        <div className="checkout-payment">
          <h3>Payment Method</h3>
          <p>Cash on Delivery <span>Pay when your order arrives. No online payment is currently configured.</span></p>
        </div>

        <button type="submit" className="btn-primary" disabled={placing || items.length === 0}>
          {placing ? "Placing order..." : `Place Order - ₹${total.toLocaleString("en-IN")}`}
        </button>
      </form>

      <aside className="checkout-summary">
        <h3>Order Summary</h3>
        <ul>
          {items.map(({ product, quantity }) => (
            <li key={product._id}>
              <span>{product.name} × {quantity}</span><strong>₹{(product.price * quantity).toLocaleString("en-IN")}</strong>
            </li>
          ))}
        </ul>
        <div className="checkout-total">
          <span>Subtotal</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <div className="checkout-total checkout-shipping">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="checkout-total">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </aside>
    </div>
  );
}
