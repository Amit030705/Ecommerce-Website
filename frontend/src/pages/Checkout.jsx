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

    if (!address.street || !address.city || !address.pincode) {
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
        <h2>Shipping Address</h2>
        {error && <p className="form-error">{error}</p>}

        <label>
          Street address
          <input type="text" name="street" value={address.street} onChange={handleChange} required />
        </label>

        <div className="form-row">
          <label>
            City
            <input type="text" name="city" value={address.city} onChange={handleChange} required />
          </label>
          <label>
            State
            <input type="text" name="state" value={address.state} onChange={handleChange} />
          </label>
        </div>

        <div className="form-row">
          <label>
            Pincode
            <input type="text" name="pincode" value={address.pincode} onChange={handleChange} required />
          </label>
          <label>
            Phone
            <input type="tel" name="phone" value={address.phone} onChange={handleChange} />
          </label>
        </div>

        <div className="checkout-payment">
          <h3>Payment Method</h3>
          <p>Cash on Delivery (only option currently available)</p>
        </div>

        <button type="submit" className="btn-primary" disabled={placing}>
          {placing ? "Placing order..." : `Place Order - ₹${total.toLocaleString("en-IN")}`}
        </button>
      </form>

      <aside className="checkout-summary">
        <h3>Order Summary</h3>
        <ul>
          {items.map(({ product, quantity }) => (
            <li key={product._id}>
              {product.name} × {quantity} — ₹{(product.price * quantity).toLocaleString("en-IN")}
            </li>
          ))}
        </ul>
        <div className="checkout-total">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </aside>
    </div>
  );
}
