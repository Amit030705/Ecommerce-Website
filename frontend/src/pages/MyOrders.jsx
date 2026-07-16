import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";

export default function MyOrders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/mine");
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p className="page-loading">Loading your orders...</p>;

  return (
    <div className="orders-page">
      <h2>My Orders</h2>

      {location.state?.justPlacedOrderId && (
        <p className="success-banner">Your order was placed successfully!</p>
      )}

      {orders.length === 0 && <p>You haven't placed any orders yet.</p>}

      <ul className="order-list">
        {orders.map((order) => (
          <li key={order._id} className="order-card">
            <div className="order-card-header">
              <span>Order #{order._id.slice(-6).toUpperCase()}</span>
              <span className={`order-status status-${order.orderStatus}`}>{order.orderStatus}</span>
            </div>

            <ul className="order-items">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} × {item.quantity} — ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </li>
              ))}
            </ul>

            <div className="order-card-footer">
              <span>Total: ₹{order.totalAmount.toLocaleString("en-IN")}</span>
              <span>Payment: Cash on Delivery</span>
              {order.expectedDelivery && (
                <span>
                  Expected delivery:{" "}
                  {new Date(order.expectedDelivery).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
