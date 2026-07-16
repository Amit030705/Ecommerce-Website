const Product = require("../models/Product");
const Review = require("../models/Review");

// @route   GET /api/products
// @desc    list products, supports simple search + category filter via query params
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;

    const filter = {};
    if (keyword) {
      filter.$text = { $search: keyword };
    }
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("seller", "name")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch products" });
  }
};

// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name email");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ product: product._id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ product, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch product" });
  }
};

// @route   POST /api/products
// @access  Private (seller only)
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, image, returnPolicy, deliveryDays } = req.body;

    if (!name || !description || !category || price === undefined) {
      return res.status(400).json({ message: "Please fill all required product fields" });
    }

    const product = await Product.create({
      seller: req.user._id,
      name,
      description,
      category,
      price,
      stock: stock || 0,
      image,
      returnPolicy,
      deliveryDays,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create product" });
  }
};

// @route   PUT /api/products/:id
// @access  Private (only the seller who owns the product)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own products" });
    }

    const fields = ["name", "description", "category", "price", "stock", "image", "returnPolicy", "deliveryDays"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update product" });
  }
};

// @route   DELETE /api/products/:id
// @access  Private (only the seller who owns the product)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete product" });
  }
};

// @route   GET /api/products/seller/mine
// @access  Private (seller only)
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch your products" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};
