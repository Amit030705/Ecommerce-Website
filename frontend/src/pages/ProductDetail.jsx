import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  // new review form state
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReviews(data.reviews);
    } catch (err) {
      setError("Could not load this product.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product._id, 1);
    } catch (err) {
      alert(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");

    if (!user) {
      navigate("/login");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      setReviewForm({ rating: 5, comment: "" });
      await loadProduct(); // refresh reviews + average rating
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <p className="page-loading">Loading product...</p>;
  if (error) return <p className="form-error">{error}</p>;
  if (!product) return null;

  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + product.deliveryDays);

  return (
    <div className="product-detail">
      <div className="product-detail-main">
        <img src={product.image} alt={product.name} className="product-detail-img" />

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <StarRating rating={product.ratingsAverage} numReviews={product.numReviews} />
          <p className="product-detail-price">₹{product.price.toLocaleString("en-IN")}</p>
          <p className="product-detail-desc">{product.description}</p>

          <ul className="product-detail-meta">
            <li>
              <strong>Sold by:</strong> {product.seller?.name || "Unknown seller"}
            </li>
            <li>
              <strong>Return policy:</strong> {product.returnPolicy}
            </li>
            <li>
              <strong>Delivery:</strong> Expected by{" "}
              {expectedDeliveryDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </li>
            <li>
              <strong>Payment:</strong> Cash on Delivery only
            </li>
            <li>
              <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
            </li>
          </ul>

          <button
            className="btn-primary"
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
          >
            {product.stock === 0 ? "Out of stock" : addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      <section className="reviews-section">
        <h2>Customer Reviews ({reviews.length})</h2>

        {reviews.length === 0 && <p>No reviews yet. Be the first to review this product.</p>}

        <ul className="review-list">
          {reviews.map((review) => (
            <li key={review._id} className="review-item">
              <strong>{review.user?.name || "Anonymous"}</strong> — {review.rating} ★
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>

        <form className="review-form" onSubmit={handleReviewSubmit}>
          <h3>Write a review</h3>
          {reviewError && <p className="form-error">{reviewError}</p>}

          <label>
            Rating
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} star{r > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Comment
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
              rows={3}
            />
          </label>

          <button type="submit" disabled={submittingReview}>
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </section>
    </div>
  );
}
