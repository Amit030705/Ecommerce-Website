const jwt = require("jsonwebtoken");
const User = require("../models/User");

// checks for a valid token and attaches the logged in user to req.user
const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
};

// use after `protect` to restrict a route to sellers only
const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    return next();
  }
  return res.status(403).json({ message: "Only sellers can access this route" });
};

module.exports = { protect, sellerOnly };
