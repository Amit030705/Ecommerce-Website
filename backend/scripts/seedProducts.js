require("dotenv").config();
require("dns").setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");

const products = [
  {
    sku: "SK-DEMO-AUDIO-001",
    name: "Studio Wireless Headphones",
    description: "Comfortable over-ear headphones with rich, balanced sound and an all-day battery for focused listening.",
    category: "Electronics",
    brand: "Soundform",
    price: 7499,
    originalPrice: 8999,
    stock: 34,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
    badge: "Editor's pick",
  },
  {
    sku: "SK-DEMO-AUDIO-002",
    name: "True Wireless Earbuds",
    description: "Pocket-sized wireless earbuds with a secure fit, clear calls and a compact charging case.",
    category: "Electronics",
    brand: "Soundform",
    price: 3299,
    originalPrice: 3999,
    stock: 52,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
    badge: "Everyday essential",
  },
  {
    sku: "SK-DEMO-AUDIO-003",
    name: "Portable Bluetooth Speaker",
    description: "A compact, travel-ready speaker with room-filling sound, simple controls and a durable finish.",
    category: "Electronics",
    brand: "Northstar Audio",
    price: 4599,
    originalPrice: 5499,
    stock: 27,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
  },
  {
    sku: "SK-DEMO-CAMERA-001",
    name: "Mirrorless Creator Camera",
    description: "A lightweight mirrorless camera for crisp everyday photography, travel stories and creative projects.",
    category: "Electronics",
    brand: "Lumio",
    price: 54990,
    originalPrice: 59990,
    stock: 8,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
    badge: "New arrival",
  },
  {
    sku: "SK-DEMO-COMPUTE-001",
    name: "Everyday 14-inch Laptop",
    description: "A slim, dependable laptop for work, study and downtime, with a vivid display and a refined aluminium body.",
    category: "Electronics",
    brand: "Northstar",
    price: 62990,
    originalPrice: 67990,
    stock: 11,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
  },
  {
    sku: "SK-DEMO-COMPUTE-002",
    name: "Compact Mechanical Keyboard",
    description: "A tidy, tactile keyboard with a compact footprint for a more considered home-office setup.",
    category: "Electronics",
    brand: "Keyspace",
    price: 6499,
    originalPrice: 7499,
    stock: 19,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-COMPUTE-003",
    name: "27-inch 4K Display",
    description: "A sharp, colour-rich display that brings a little more room and clarity to work and entertainment.",
    category: "Electronics",
    brand: "Viewline",
    price: 28990,
    originalPrice: 31990,
    stock: 9,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-MOBILE-001",
    name: "Everyday Smartphone",
    description: "A thoughtfully designed smartphone with a bright screen, dependable cameras and smooth everyday performance.",
    category: "Electronics",
    brand: "Northstar",
    price: 24990,
    originalPrice: 27990,
    stock: 16,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-WEARABLE-001",
    name: "Minimal Dial Wristwatch",
    description: "A clean, versatile everyday watch with a timeless dial and a comfortable strap.",
    category: "Lifestyle",
    brand: "Meridian",
    price: 3799,
    originalPrice: 4499,
    stock: 23,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
  },
  {
    sku: "SK-DEMO-HOME-001",
    name: "Sculpted Table Lamp",
    description: "A warm, sculptural table lamp that brings a softer glow to bedside tables, shelves and reading nooks.",
    category: "Home",
    brand: "Form & Field",
    price: 2899,
    originalPrice: 3499,
    stock: 21,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
  },
  {
    sku: "SK-DEMO-HOME-002",
    name: "Hand-finished Ceramic Mug Set",
    description: "A pair of smooth, hand-finished stoneware mugs made for slow mornings and long conversations.",
    category: "Home",
    brand: "Clay House",
    price: 899,
    originalPrice: 1199,
    stock: 46,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-HOME-003",
    name: "Linen-blend Duvet Cover",
    description: "A breathable, relaxed-texture duvet cover that gives your bedroom a calm, naturally layered feel.",
    category: "Home",
    brand: "Soft Sunday",
    price: 4299,
    originalPrice: 4999,
    stock: 13,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-HOME-004",
    name: "Oak Accent Lounge Chair",
    description: "A considered accent chair with a sculptural silhouette for a reading corner or relaxed living space.",
    category: "Home",
    brand: "Form & Field",
    price: 12990,
    originalPrice: 14990,
    stock: 6,
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
  },
  {
    sku: "SK-DEMO-HOME-005",
    name: "Insulated Steel Water Bottle",
    description: "A reusable double-wall steel bottle that keeps drinks close at hand from the commute to the weekend.",
    category: "Lifestyle",
    brand: "Daymark",
    price: 1199,
    originalPrice: 1499,
    stock: 38,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-HOME-006",
    name: "Textured Ceramic Vase",
    description: "A tactile ceramic vase with an understated profile, designed to look lovely with or without flowers.",
    category: "Home",
    brand: "Clay House",
    price: 1599,
    originalPrice: 1899,
    stock: 17,
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-FASHION-001",
    name: "Everyday Retro Sneakers",
    description: "Versatile low-profile sneakers with a cushioned sole and a timeless shape for daily wear.",
    category: "Fashion",
    brand: "Common Ground",
    price: 3599,
    originalPrice: 4299,
    stock: 25,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
    badge: "Just in",
  },
  {
    sku: "SK-DEMO-FASHION-002",
    name: "Organic Cotton Everyday Tee",
    description: "A soft, breathable cotton tee with an easy fit and a clean finish for everyday layering.",
    category: "Fashion",
    brand: "Common Ground",
    price: 899,
    originalPrice: 1199,
    stock: 43,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-FASHION-003",
    name: "Canvas Weekender Backpack",
    description: "A practical canvas backpack with considered storage for workdays, short trips and everything between.",
    category: "Fashion",
    brand: "Daymark",
    price: 2799,
    originalPrice: 3299,
    stock: 18,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
  },
  {
    sku: "SK-DEMO-FASHION-004",
    name: "Classic Acetate Sunglasses",
    description: "A flattering everyday frame with UV-protective lenses and a timeless, easy-to-style silhouette.",
    category: "Fashion",
    brand: "Meridian",
    price: 1899,
    originalPrice: 2299,
    stock: 30,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-LIFESTYLE-001",
    name: "Daily Hydration Serum",
    description: "A lightweight hydrating serum made for a simple, comfortable morning and evening skincare routine.",
    category: "Lifestyle",
    brand: "Kindred Skin",
    price: 1299,
    originalPrice: 1599,
    stock: 32,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1000&q=85",
    isFeatured: true,
    badge: "Customer favorite",
  },
  {
    sku: "SK-DEMO-LIFESTYLE-002",
    name: "Everyday Yoga Mat",
    description: "A supportive, grippy yoga mat for stretching, mindful movement and home workouts.",
    category: "Lifestyle",
    brand: "Daymark",
    price: 1699,
    originalPrice: 1999,
    stock: 20,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-BOOKS-001",
    name: "The Art of Slow Living",
    description: "A beautifully presented hardcover collection of ideas for creating more thoughtful everyday rituals.",
    category: "Books",
    brand: "Paper & Pine",
    price: 799,
    originalPrice: 999,
    stock: 29,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-LIFESTYLE-003",
    name: "Pocket Everyday Journal",
    description: "A neatly bound notebook with smooth, fountain-pen-friendly pages for lists, plans and passing thoughts.",
    category: "Lifestyle",
    brand: "Paper & Pine",
    price: 549,
    originalPrice: 699,
    stock: 57,
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
  {
    sku: "SK-DEMO-HOME-007",
    name: "Rechargeable Ambient Speaker",
    description: "A portable tabletop speaker with a warm, understated form that fits naturally into your home.",
    category: "Home",
    brand: "Northstar Audio",
    price: 5899,
    originalPrice: 6499,
    stock: 12,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85",
    isFeatured: false,
  },
];

async function seedProducts() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required. Set it in backend/.env before seeding.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const sellerFilter = { role: "seller" };
  if (process.env.DEMO_SELLER_EMAIL) {
    sellerFilter.email = process.env.DEMO_SELLER_EMAIL.toLowerCase().trim();
  }
  const seller = await User.findOne(sellerFilter).sort({ createdAt: 1 });
  if (!seller) {
    throw new Error(
      process.env.DEMO_SELLER_EMAIL
        ? "No seller account matches DEMO_SELLER_EMAIL."
        : "No seller account exists yet. Register a seller account, then run the seed command again."
    );
  }

  let inserted = 0;
  let alreadyPresent = 0;
  for (const product of products) {
    const result = await Product.updateOne(
      { sku: product.sku },
      { $setOnInsert: { ...product, seller: seller._id } },
      { upsert: true, runValidators: true }
    );
    if (result.upsertedCount) inserted += 1;
    else alreadyPresent += 1;
  }

  console.log(`Demo catalog complete: ${inserted} added, ${alreadyPresent} already present.`);
}

seedProducts()
  .catch((error) => {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
