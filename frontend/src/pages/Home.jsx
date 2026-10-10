import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const PAGE_SIZE = 12;

function ProductSkeleton() {
  return (
    <div className="product-skeleton" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line-short" />
    </div>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  const [featuredError, setFeaturedError] = useState("");
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/products/categories")
      .then(({ data }) => {
        if (active) {
          setCategories(data);
          setCategoryError("");
        }
      })
      .catch(() => {
        if (active) setCategoryError("Categories are temporarily unavailable.");
      });
    api.get("/products", { params: { featured: true, limit: 4, sort: "popular" } })
      .then(({ data }) => {
        if (active) setFeatured(data.products || []);
      })
      .catch(() => {
        if (active) setFeaturedError("Featured products are temporarily unavailable.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/products", {
          params: {
            keyword: keyword || undefined,
            category: category || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            sort,
            page,
            limit: PAGE_SIZE,
          },
        });
        if (active) {
          setProducts(data.products);
          setTotal(data.total);
          setPages(Math.max(1, data.pages));
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Could not load products right now.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, [keyword, category, minPrice, maxPrice, sort, page, retryCount]);

  const selectCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next);
    setPage(1);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    next.delete("keyword");
    setSearchParams(next);
  };

  const retry = () => {
    setError("");
    setRetryCount((count) => count + 1);
  };

  return (
    <div className="storefront">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">THE EVERYDAY EDIT</span>
          <h1>Good things.<br />Chosen well.</h1>
          <p>Thoughtful finds for the way you live, work and unwind.</p>
          <div className="hero-actions">
            <a className="btn-primary" href="#catalog">Explore the collection <span aria-hidden="true">↗</span></a>
            <span className="hero-note">A little more joy, in every delivery.</span>
          </div>
        </div>
        <div className="hero-image" role="img" aria-label="A considered collection of everyday essentials" />
        <div className="hero-stamp"><span>MADE FOR<br />YOUR EVERYDAY</span><span aria-hidden="true">✳</span></div>
      </section>

      <section className="category-strip" aria-labelledby="category-heading">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FIND YOUR NEXT FAVORITE</span>
            <h2 id="category-heading">Shop by category</h2>
          </div>
          <button className={!category ? "category-pill selected" : "category-pill"} onClick={() => selectCategory("")}>
            Everything
          </button>
        </div>
        <div className="category-list">
          {categories.map((item) => (
            <button
              className={category === item ? "category-pill selected" : "category-pill"}
              key={item}
              onClick={() => selectCategory(category === item ? "" : item)}
            >
              {item}<span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        {categoryError && <p className="inline-error" role="status">{categoryError}</p>}
      </section>

      {featuredError && <p className="inline-error" role="status">{featuredError}</p>}
      {featured.length > 0 && (
        <section className="featured-section" aria-labelledby="featured-heading">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A FEW THINGS WE LOVE</span>
              <h2 id="featured-heading">The considered edit</h2>
            </div>
            <a className="text-link" href="#catalog">Shop all products <span aria-hidden="true">→</span></a>
          </div>
          <div className="product-grid featured-grid">
            {featured.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </section>
      )}

      <section className="catalog-section" id="catalog" aria-labelledby="catalog-heading">
        <div className="section-heading catalog-heading">
          <div>
            <span className="eyebrow">{keyword ? "SEARCH RESULTS" : "MADE FOR EVERY DAY"}</span>
            <h2 id="catalog-heading">{keyword ? `Finding “${keyword}”` : "The latest finds"}</h2>
            <p className="catalog-count">{loading ? "Finding your next favorite…" : `${total} ${total === 1 ? "product" : "products"} to explore`}</p>
          </div>
          <label className="sort-control">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        <div className="catalog-layout">
          <aside className="catalog-filters" aria-label="Product filters">
            <div className="filter-title">
              <h3>Refine your search</h3>
              <button className="text-link" onClick={clearFilters}>Clear all</button>
            </div>
            <label className="filter-label">
              Category
              <select value={category} onChange={(event) => selectCategory(event.target.value)}>
                <option value="">All categories</option>
                {categories.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </label>
            <fieldset className="price-filter">
              <legend>Price range <span>(₹)</span></legend>
              <div className="price-inputs">
                <label>
                  <span className="visually-hidden">Minimum price</span>
                  <input type="number" min="0" placeholder="Min" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); }} />
                </label>
                <span aria-hidden="true">—</span>
                <label>
                  <span className="visually-hidden">Maximum price</span>
                  <input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }} />
                </label>
              </div>
            </fieldset>
          </aside>

          <div className="catalog-results">
            {error && (
              <div className="catalog-message error-state" role="alert">
                <p>{error}</p>
                <button className="btn-secondary" onClick={retry}>Try again</button>
              </div>
            )}
            {loading && <div className="product-grid">{Array.from({ length: 8 }, (_, index) => <ProductSkeleton key={index} />)}</div>}
            {!loading && !error && products.length === 0 && (
              <div className="catalog-message empty-state">
                <span aria-hidden="true">⌕</span>
                <h3>No finds this time</h3>
                <p>Try another search or clear a filter to see what’s available.</p>
                <button className="btn-secondary" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="product-grid">
                  {products.map((product) => <ProductCard key={product._id} product={product} />)}
                </div>
                {pages > 1 && (
                  <nav className="pagination" aria-label="Product pages">
                    <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <span>Page {page} of {pages}</span>
                    <button className="btn-secondary" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="service-note">
        <span aria-hidden="true">✳</span>
        <p>Good design, honest prices, and delivery right to your door.</p>
        <Link to="/register">Get started <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
