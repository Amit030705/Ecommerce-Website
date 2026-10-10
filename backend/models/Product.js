const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
    returnPolicy: {
      // e.g. "7 days easy return", "No return", "10 days replacement only"
      type: String,
      default: "7 days easy return",
    },
    deliveryDays: {
      // estimated number of days to deliver, used to calculate expected delivery date
      type: Number,
      default: 5,
      min: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sku: {
      type: String,
      trim: true,
      index: true,
    },
    badge: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// simple text index so search feels less painful to implement later
productSchema.index({ name: "text", description: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
