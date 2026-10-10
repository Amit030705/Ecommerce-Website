import { useState } from "react";

const defaultValues = {
  name: "",
  description: "",
  category: "Electronics",
  price: "",
  stock: "",
  image: "",
  returnPolicy: "7 days easy return",
  deliveryDays: 5,
  originalPrice: "",
  brand: "",
  sku: "",
  badge: "",
  isFeatured: false,
};

// shared between AddProduct and EditProduct so the fields stay in sync
export default function ProductForm({ initialValues, onSubmit, submitLabel }) {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.description.trim() || form.price === "" || Number(form.price) < 0) {
      setError("Name, description and price are required");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        deliveryDays: Number(form.deliveryDays) || 5,
        originalPrice: form.originalPrice === "" ? undefined : Number(form.originalPrice),
        isFeatured: Boolean(form.isFeatured),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <label>
        Product name
        <input type="text" name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} required />
      </label>

      <div className="form-row">
        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange}>
            {["Electronics", "Fashion", "Home", "Lifestyle", "Books", "Grocery", "Toys"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Price (₹)
          <input type="number" name="price" min="0" value={form.price} onChange={handleChange} required />
        </label>
      </div>

      <div className="form-row">
        <label>
          Brand
          <input type="text" name="brand" value={form.brand} onChange={handleChange} />
        </label>

        <label>
          Original price (₹)
          <input type="number" name="originalPrice" min="0" value={form.originalPrice} onChange={handleChange} />
        </label>
      </div>

      <div className="form-row">
        <label>
          SKU
          <input type="text" name="sku" value={form.sku} onChange={handleChange} />
        </label>

        <label>
          Product badge
          <input type="text" name="badge" placeholder="e.g. Bestseller" value={form.badge} onChange={handleChange} />
        </label>
      </div>

      <label className="checkbox-label">
        <input type="checkbox" name="isFeatured" checked={Boolean(form.isFeatured)} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
        Feature this product on the storefront
      </label>

      <div className="form-row">
        <label>
          Stock quantity
          <input type="number" name="stock" min="0" value={form.stock} onChange={handleChange} />
        </label>

        <label>
          Delivery time (days)
          <input
            type="number"
            name="deliveryDays"
            min="0"
            value={form.deliveryDays}
            onChange={handleChange}
          />
        </label>
      </div>

      <label>
        Return policy
        <input type="text" name="returnPolicy" value={form.returnPolicy} onChange={handleChange} />
      </label>

      <label>
        Image URL
        <input
          type="text"
          name="image"
          placeholder="https://example.com/product.jpg"
          value={form.image}
          onChange={handleChange}
        />
      </label>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
