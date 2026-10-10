const Product = require("../models/Product");
const Review = require("../models/Review");

const validateProductNumbers = (values) => {
  const fields = ["price", "stock", "deliveryDays", "originalPrice"];
  for (const field of fields) {
    if (values[field] === undefined || values[field] === "") continue;
    const number = Number(values[field]);
    if (!Number.isFinite(number) || number < 0 || (field === "stock" && !Number.isInteger(number))) {
      return `${field} must be a valid non-negative${field === "stock" ? " whole" : ""} number`;
    }
  }
  return null;
};

// @route   GET /api/products
// @desc    list products, supports simple search + category filter via query params
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, sort, featured } = req.query;

    const filter = {};
    if (typeof keyword === "string" && keyword.trim()) {
      filter.$text = { $search: keyword.trim() };
    }
    if (typeof category === "string" && category.trim()) {
      filter.category = category;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceRange = {};
      if (minPrice !== undefined) priceRange.$gte = Number(minPrice);
      if (maxPrice !== undefined) priceRange.$lte = Number(maxPrice);
      if (Object.values(priceRange).some((value) => !Number.isFinite(value) || value < 0)) {
        return res.status(400).json({ message: "Price filters must be valid non-negative numbers" });
      }
      if (priceRange.$gte !== undefined && priceRange.$lte !== undefined && priceRange.$gte > priceRange.$lte) {
        return res.status(400).json({ message: "Minimum price cannot exceed maximum price" });
      }
      filter.price = priceRange;
    }
    if (featured === "true") filter.isFeatured = true;

    const sortOptions = {
      newest: { createdAt: -1 },
      "price-asc": { price: 1, createdAt: -1 },
      "price-desc": { price: -1, createdAt: -1 },
      popular: { numReviews: -1, ratingsAverage: -1, createdAt: -1 },
    };
    const sortOrder = sortOptions[sort] || sortOptions.newest;
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;

    if (!hasPagination) {
      const products = await Product.find(filter).populate("seller", "name").sort(sortOrder);
      return res.json(products);
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
      return res.status(400).json({ message: "Page and limit must be positive integers" });
    }

    const safeLimit = Math.min(limit, 48);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("seller", "name")
        .sort(sortOrder)
        .skip((page - 1) * safeLimit)
        .limit(safeLimit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / safeLimit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch products" });
  }
};

const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories.filter(Boolean).sort((a, b) => a.localeCompare(b)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch product categories" });
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
    const {
      name,
      description,
      category,
      price,
      stock,
      image,
      returnPolicy,
      deliveryDays,
      originalPrice,
      brand,
      isFeatured,
      sku,
      badge,
    } = req.body;

    if (!name || !description || !category || price === undefined) {
      return res.status(400).json({ message: "Please fill all required product fields" });
    }
    const validationMessage = validateProductNumbers({ price, stock, deliveryDays, originalPrice });
    if (validationMessage) return res.status(400).json({ message: validationMessage });

    const product = await Product.create({
      seller: req.user._id,
      name,
      description,
      category,
      stock: stock === undefined ? 0 : Number(stock),
      price: Number(price),
      image,
      returnPolicy,
      deliveryDays,
      originalPrice,
      brand,
      isFeatured,
      sku,
      badge,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }
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

    const fields = [
      "name",
      "description",
      "category",
      "price",
      "stock",
      "image",
      "returnPolicy",
      "deliveryDays",
      "originalPrice",
      "brand",
      "isFeatured",
      "sku",
      "badge",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });
    const validationMessage = validateProductNumbers(req.body);
    if (validationMessage) return res.status(400).json({ message: validationMessage });

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }
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
  getProductCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};
