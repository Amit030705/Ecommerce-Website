import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";
import fallbackImage from "../assets/product-fallback.svg";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReviews(data.reviews);
      setQuantity(1);
      try {
        const relatedResponse = await api.get("/products", {
          params: { category: data.product.category, limit: 4, sort: "popular" },
        });
        setRelated(relatedResponse.data.products.filter((item) => item._id !== data.product._id));
      } catch (relatedError) {
        console.error("Could not load related products", relatedError);
        setRelated([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load this product.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    // loadProduct is intentionally tied to the route id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add this item to your bag.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError("");
    if (!user) {
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      await loadProduct();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <p className="page-loading">Finding the details…</p>;
  if (error && !product) {
    return <div className="catalog-message error-state" role="alert"><p>{error}</p><button className="btn-secondary" onClick={loadProduct}>Try again</button></div>;
  }
  if (!product) return null;

  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + (product.deliveryDays || 5));
  const hasDiscount = product.originalPrice > product.price;

  return (
    <div className="product-detail-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span>/</span>
        <Link to={`/?category=${encodeURIComponent(product.category)}#catalog`}>{product.category}</Link><span>/</span>
        <span>{product.name}</span>
      </nav>

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="product-detail">
        <div className="product-detail-main">
          <div className="product-detail-image-wrap">
            <img
              src={product.image || fallbackImage}
              alt={product.name}
              className="product-detail-img"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = fallbackImage;
              }}
            />
            {product.badge && <span className="product-badge">{product.badge}</span>}
          </div>

          <div className="product-detail-info">
            <span className="eyebrow">{product.brand || product.category}</span>
            <h1>{product.name}</h1>
            <StarRating rating={product.ratingsAverage} numReviews={product.numReviews} />
            <div className="detail-price">
              <p className="product-detail-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
              {hasDiscount && (
                <>
                  <span className="product-card-original">₹{Number(product.originalPrice).toLocaleString("en-IN")}</span>
                  <span className="detail-discount">{Math.round((1 - product.price / product.originalPrice) * 100)}% off</span>
                </>
              )}
            </div>
            <p className="product-detail-desc">{product.description}</p>
            <ul className="product-detail-meta">
              {product.sku && <li><strong>SKU</strong><span>{product.sku}</span></li>}
              <li><strong>Sold by</strong><span>{product.seller?.name || "ShopKart seller"}</span></li>
              <li><strong>Returns</strong><span>{product.returnPolicy}</span></li>
              <li><strong>Delivery</strong><span>Expected by {expectedDeliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></li>
              <li><strong>Availability</strong><span className={product.stock > 0 ? "stock-available" : "stock-unavailable"}>{product.stock > 0 ? `${product.stock} available` : "Currently unavailable"}</span></li>
              <li><strong>Payment</strong><span>Cash on Delivery</span></li>
            </ul>
            {product.stock > 0 && (
              <label className="quantity-control">
                Quantity
                <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, index) => (
                    <option key={index + 1} value={index + 1}>{index + 1}</option>
                  ))}
                </select>
              </label>
            )}
            <button className="btn-primary detail-add-button" onClick={handleAddToCart} disabled={addingToCart || product.stock < 1}>
              {product.stock < 1 ? "Out of stock" : addingToCart ? "Adding to bag…" : "Add to bag"}
            </button>
            <p className="detail-delivery-note">Carefully packed · Easy returns · Secure checkout</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading">
            <div><span className="eyebrow">MORE TO DISCOVER</span><h2>You might also like</h2></div>
          </div>
          <div className="product-grid">{related.map((item) => <ProductCard key={item._id} product={item} />)}</div>
        </section>
      )}

      <section className="reviews-section">
        <div className="section-heading">
          <div><span className="eyebrow">FROM OUR COMMUNITY</span><h2>Customer reviews</h2></div>
          <StarRating rating={product.ratingsAverage} numReviews={reviews.length} />
        </div>
        {reviews.length === 0 && <p className="review-empty">No reviews yet. Be the first to share your experience.</p>}
        <ul className="review-list">
          {reviews.map((review) => (
            <li key={review._id} className="review-item">
              <div className="review-author"><strong>{review.user?.name || "Customer"}</strong><span>{review.rating} / 5 ★</span></div>
              <p>{review.comment}</p>
              <span className="review-date">{new Date(review.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
            </li>
          ))}
        </ul>
        <form className="review-form" onSubmit={handleReviewSubmit}>
          <h3>Share your thoughts</h3>
          {reviewError && <p className="form-error">{reviewError}</p>}
          <label>
            Your rating
            <select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating > 1 ? "s" : ""}</option>)}
            </select>
          </label>
          <label>
            Your review
            <textarea value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} required minLength={3} rows={4} />
          </label>
          <button className="btn-secondary" type="submit" disabled={submittingReview}>{submittingReview ? "Sending…" : "Submit review"}</button>
        </form>
      </section>
    </div>
  );
}
