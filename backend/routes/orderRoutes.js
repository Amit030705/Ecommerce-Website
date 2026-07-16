const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, sellerOnly } = require("../middleware/authMiddleware");

router.post("/", protect, placeOrder);
router.get("/mine", protect, getMyOrders);
router.get("/seller", protect, sellerOnly, getSellerOrders);
router.put("/:id/status", protect, sellerOnly, updateOrderStatus);

module.exports = router;
