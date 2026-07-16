import { Link } from "react-router-dom";
import StarRating from "./StarRating";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <img src={product.image} alt={product.name} className="product-card-img" />
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        <StarRating rating={product.ratingsAverage} numReviews={product.numReviews} />
        <p className="product-card-price">₹{product.price.toLocaleString("en-IN")}</p>
        <p className="product-card-delivery">Delivery in {product.deliveryDays} days</p>
      </div>
    </Link>
  );
}
