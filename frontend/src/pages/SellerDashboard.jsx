import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import fallbackImage from "../assets/product-fallback.svg";

export default function SellerDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalItemsSold: 0, orders: [] });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/orders/seller"),
        api.get("/products/seller/mine"),
      ]);
      setStats(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your seller dashboard.");
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
      setError(err.response?.data?.message || "Could not delete product");
    }
  };

  if (loading) return <p className="page-loading">Loading dashboard...</p>;

  const categories = [...new Set(products.map((product) => product.category))].sort();
  const filteredProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.brand || ""} ${product.sku || ""}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!category || product.category === category);
  });
  const lowStockCount = products.filter((product) => product.stock < 5).length;

  return (
    <div className="seller-dashboard">
      {error && <p className="form-error" role="alert">{error} <button className="text-link" onClick={loadData}>Try again</button></p>}
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
        <div className="stat-card">
          <span className="stat-value">{lowStockCount}</span>
          <span className="stat-label">Low stock (under 5)</span>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>My Products</h2>
          <Link to="/seller/add-product" className="btn-primary">
            + Add Product
          </Link>
        </div>
        <div className="dashboard-product-filters">
          <input
            type="search"
            placeholder="Search name, brand or SKU"
            aria-label="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select aria-label="Filter products by category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        {products.length === 0 && <p>You haven't listed any products yet.</p>}
        {products.length > 0 && filteredProducts.length === 0 && <p>No products match these filters.</p>}

        <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td><img className="dashboard-product-image" src={product.image || fallbackImage} alt="" /></td>
                <td>{product.name}<small>{product.category}{product.sku ? ` · ${product.sku}` : ""}</small></td>
                <td>₹{product.price.toLocaleString("en-IN")}</td>
                <td className={product.stock < 5 ? "inventory-low" : ""}>{product.stock}{product.stock < 5 ? " · Low" : ""}</td>
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
        </div>
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
