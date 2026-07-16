// small presentational component for showing an average rating like 4.3 out of 5
export default function StarRating({ rating = 0, numReviews }) {
  return (
    <span className="star-rating">
      <span className="star-rating-badge">
        {rating > 0 ? rating.toFixed(1) : "New"} ★
      </span>
      {typeof numReviews === "number" && (
        <span className="star-rating-count">({numReviews})</span>
      )}
    </span>
  );
}
