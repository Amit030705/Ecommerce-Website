import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function SellerDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalItemsSold: 0, orders: [] });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/orders/seller"),
        api.get("/products/seller/mine"),
      ]);
      setStats(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete product");
    }
  };

  if (loading) return <p className="page-loading">Loading dashboard...</p>;

  return (
    <div className="seller-dashboard">
      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.totalOrders}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">₹{stats.totalRevenue.toLocaleString("en-IN")}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalItemsSold}</span>
          <span className="stat-label">Items Sold</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{products.length}</span>
          <span className="stat-label">Products Listed</span>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>My Products</h2>
          <Link to="/seller/add-product" className="btn-primary">
            + Add Product
          </Link>
        </div>

        {products.length === 0 && <p>You haven't listed any products yet.</p>}

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>₹{product.price.toLocaleString("en-IN")}</td>
                <td>{product.stock}</td>
                <td>{product.ratingsAverage > 0 ? `${product.ratingsAverage} ★ (${product.numReviews})` : "No reviews"}</td>
                <td>
                  <Link to={`/seller/edit-product/${product._id}`}>Edit</Link>
                  {" | "}
                  <button className="link-danger" onClick={() => handleDeleteProduct(product._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="dashboard-section">
        <h2>Orders for My Products</h2>

        {stats.orders.length === 0 && <p>No orders yet.</p>}

        <ul className="order-list">
          {stats.orders.map((order) => (
            <li key={order._id} className="order-card">
              <div className="order-card-header">
                <span>Order #{order._id.slice(-6).toUpperCase()}</span>
                <span>Buyer: {order.buyer?.name}</span>
              </div>

              <ul className="order-items">
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} × {item.quantity} — ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </li>
                ))}
              </ul>

              <div className="order-card-footer">
                <span>My total: ₹{order.myTotal.toLocaleString("en-IN")}</span>
                <span>
                  Ship to: {order.shippingAddress.city}, {order.shippingAddress.pincode}
                </span>

                <select
                  value={order.orderStatus}
                  disabled={updatingId === order._id}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option value="placed">Placed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
