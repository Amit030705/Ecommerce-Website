const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require("../controllers/productController");
const { addReview } = require("../controllers/reviewController");
const { protect, sellerOnly } = require("../middleware/authMiddleware");

// note: /seller/mine must be declared before /:id or express will treat "seller" as an id
router.get("/seller/mine", protect, sellerOnly, getMyProducts);

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, sellerOnly, createProduct);
router.put("/:id", protect, sellerOnly, updateProduct);
router.delete("/:id", protect, sellerOnly, deleteProduct);

router.post("/:id/reviews", protect, addReview);

module.exports = router;
