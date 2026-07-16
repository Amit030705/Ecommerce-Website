const Review = require("../models/Review");
const Product = require("../models/Product");

// recalculates and stores the average rating + review count on the product
const refreshProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const numReviews = reviews.length;
  const ratingsAverage = numReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
    : 0;

  await Product.findByIdAndUpdate(productId, {
    numReviews,
    ratingsAverage: Math.round(ratingsAverage * 10) / 10, // round to 1 decimal
  });
};

// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
    });

    await refreshProductRating(productId);

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not add review" });
  }
};

// @route   DELETE /api/reviews/:id
// @access  Private (only the review's author)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own review" });
    }

    const productId = review.product;
    await review.deleteOne();
    await refreshProductRating(productId);

    res.json({ message: "Review removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete review" });
  }
};

module.exports = { addReview, deleteReview };
