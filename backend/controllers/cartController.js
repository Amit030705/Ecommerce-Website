const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart) {
      // no cart yet, just return an empty one instead of erroring out
      cart = { user: req.user._id, items: [] };
    }

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch cart" });
  }
};

// @route   POST /api/cart
// @desc    add a product to cart, or bump quantity if it's already there
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qtyToAdd = quantity && quantity > 0 ? quantity : 1;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += qtyToAdd;
    } else {
      cart.items.push({ product: productId, quantity: qtyToAdd });
    }

    await cart.save();
    const populatedCart = await cart.populate("items.product");
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not add item to cart" });
  }
};

// @route   PUT /api/cart/:productId
// @desc    update quantity of a single item in the cart
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    item.quantity = quantity;
    await cart.save();
    const populatedCart = await cart.populate("items.product");
    res.json(populatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update cart item" });
  }
};

// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    const populatedCart = await cart.populate("items.product");
    res.json(populatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not remove item from cart" });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
