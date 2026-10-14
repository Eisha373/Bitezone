import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or Expired Token", error: error.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized User!" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { verifyToken, isAdmin };