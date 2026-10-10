const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @route   POST /api/orders
// @desc    place an order from whatever is currently in the buyer's cart
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ message: "A complete shipping address is required" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const unavailableItem = cart.items.find(
      ({ product, quantity }) => !product || !Number.isInteger(quantity) || quantity < 1 || product.stock < quantity
    );
    if (unavailableItem) {
      return res.status(409).json({ message: "One or more cart items are no longer available in the requested quantity" });
    }

    let totalAmount = 0;
    let maxDeliveryDays = 0;

    const orderItems = cart.items.map(({ product, quantity }) => {
      totalAmount += product.price * quantity;
      maxDeliveryDays = Math.max(maxDeliveryDays, product.deliveryDays || 5);

      return {
        product: product._id,
        seller: product.seller,
        name: product.name,
        price: product.price,
        quantity,
      };
    });

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + maxDeliveryDays);

    const reservedProducts = [];
    for (const { product, quantity } of cart.items) {
      const reserved = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );
      if (!reserved) {
        await Promise.all(
          reservedProducts.map(({ productId, reservedQuantity }) =>
            Product.updateOne({ _id: productId }, { $inc: { stock: reservedQuantity } })
          )
        );
        return res.status(409).json({ message: "Stock changed while placing your order. Please review your cart." });
      }
      reservedProducts.push({ productId: product._id, reservedQuantity: quantity });
    }

    let order;
    try {
      order = await Order.create({
        buyer: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod: "COD",
        totalAmount,
        expectedDelivery,
      });
    } catch (err) {
      await Promise.all(
        reservedProducts.map(({ productId, reservedQuantity }) =>
          Product.updateOne({ _id: productId }, { $inc: { stock: reservedQuantity } })
        )
      );
      throw err;
    }

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not place order" });
  }
};

// @route   GET /api/orders/mine
// @desc    orders placed by the logged in buyer
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch your orders" });
  }
};

// @route   GET /api/orders/seller
// @desc    orders that contain at least one product belonging to the logged in seller,
//          plus some basic stats (total orders, total revenue for this seller)
// @access  Private (seller only)
const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.seller": req.user._id })
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    // only keep this seller's own items in each order, and total up their revenue
    let totalRevenue = 0;
    let totalItemsSold = 0;

    const sellerOrders = orders.map((order) => {
      const myItems = order.items.filter((item) => item.seller.toString() === req.user._id.toString());
      const myTotal = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      totalRevenue += myTotal;
      totalItemsSold += myItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        _id: order._id,
        buyer: order.buyer,
        shippingAddress: order.shippingAddress,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        expectedDelivery: order.expectedDelivery,
        items: myItems,
        myTotal,
      };
    });

    res.json({
      totalOrders: sellerOrders.length,
      totalRevenue,
      totalItemsSold,
      orders: sellerOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch seller orders" });
  }
};

// @route   PUT /api/orders/:id/status
// @desc    seller updates the status of an order (shipped / delivered / cancelled)
// @access  Private (seller only, and only if they own an item in the order)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["placed", "shipped", "delivered", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const sellsInThisOrder = order.items.some((item) => item.seller.toString() === req.user._id.toString());
    if (!sellsInThisOrder) {
      return res.status(403).json({ message: "You don't have any products in this order" });
    }

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update order status" });
  }
};

module.exports = { placeOrder, getMyOrders, getSellerOrders, updateOrderStatus };
