import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/products", {
          params: { keyword: keyword || undefined, category: category || undefined },
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

  const categories = ["Electronics", "Fashion", "Home", "Books", "Grocery", "Toys"];

  return (
    <div className="home-page">
      <aside className="home-filters">
        <h4>Categories</h4>
        <ul>
          <li>
            <button className={category === "" ? "active" : ""} onClick={() => setCategory("")}>
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <button className={category === c ? "active" : ""} onClick={() => setCategory(c)}>
                {c}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="home-products">
        {keyword && <p className="home-keyword">Showing results for "{keyword}"</p>}

        {loading && <p>Loading products...</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p>No products found. Try a different search or category.</p>
        )}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
