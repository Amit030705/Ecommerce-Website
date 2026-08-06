import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/products", {
          params: {
            keyword: keyword || undefined,
            category: category || undefined,
          },
        });

        setProducts(data);
      } catch (err) {
        setError("Could not load products right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, category]);

  // Categories with symbols
  const categories = [
    { name: "Electronics", icon: "📱" },
    { name: "Fashion", icon: "👕" },
    { name: "Home", icon: "🏠" },
    { name: "Books", icon: "📚" },
    { name: "Grocery", icon: "🛒" },
    { name: "Toys", icon: "🧸" },
  ];

  // Price filter
  const filteredProducts = products.filter((product) => {
    if (priceRange === "under500") {
      return product.price < 500;
    }

    if (priceRange === "500to1000") {
      return product.price >= 500 && product.price <= 1000;
    }

    if (priceRange === "1000to2000") {
      return product.price > 1000 && product.price <= 2000;
    }

    if (priceRange === "above2000") {
      return product.price > 2000;
    }

    return true;
  });

  return (
    <div className="home-page">

      {/* SIDEBAR */}
      <aside className="home-filters">

        {/* CATEGORY SECTION */}
        <div className="filter-section">
          <h4>Categories</h4>

          <ul>
            {/* ALL CATEGORY */}
            <li>
              <button
                className={category === "" ? "active" : ""}
                onClick={() => setCategory("")}
              >
                <span className="category-icon">🛍️</span>
                All
              </button>
            </li>

            {/* OTHER CATEGORIES */}
            {categories.map((c) => (
              <li key={c.name}>
                <button
                  className={category === c.name ? "active" : ""}
                  onClick={() => setCategory(c.name)}
                >
                  <span className="category-icon">{c.icon}</span>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* PRICE SECTION */}
        <div className="filter-section price-section">
          <h4>Price Range</h4>

          <ul>
            {/* ALL PRICES */}
            <li>
              <button
                className={priceRange === "" ? "active" : ""}
                onClick={() => setPriceRange("")}
              >
                <span className="category-icon">💰</span>
                All Prices
              </button>
            </li>

            {/* UNDER 500 */}
            <li>
              <button
                className={priceRange === "under500" ? "active" : ""}
                onClick={() => setPriceRange("under500")}
              >
                <span className="category-icon">💵</span>
                Under ₹500
              </button>
            </li>

            {/* 500 - 1000 */}
            <li>
              <button
                className={priceRange === "500to1000" ? "active" : ""}
                onClick={() => setPriceRange("500to1000")}
              >
                <span className="category-icon">💵</span>
                ₹500 - ₹1,000
              </button>
            </li>

            {/* 1000 - 2000 */}
            <li>
              <button
                className={priceRange === "1000to2000" ? "active" : ""}
                onClick={() => setPriceRange("1000to2000")}
              >
                <span className="category-icon">💵</span>
                ₹1,000 - ₹2,000
              </button>
            </li>

            {/* ABOVE 2000 */}
            <li>
              <button
                className={priceRange === "above2000" ? "active" : ""}
                onClick={() => setPriceRange("above2000")}
              >
                <span className="category-icon">💎</span>
                Above ₹2,000
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* PRODUCTS SECTION */}
      <section className="home-products">

        {keyword && (
          <p className="home-keyword">
            Showing results for "{keyword}"
          </p>
        )}

        {loading && <p>Loading products...</p>}

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p>
            No products found. Try a different search, category, or price range.
          </p>
        )}

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>

      </section>
    </div>
  );
}
