import express from "express";
import Product from "../models/Product.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const idURL = req.params.id;
    const productId = await Product.findById(idURL);
    if (!productId) {
      return res.status(404).json({ message: "product not found" });
    }
    res.json(productId);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, price, description, imageLink, category, prepTimeMinutes } = req.body;

    const newProduct = await Product.create({
      name,
      price,
      description,
      imageLink,
      category,
      prepTimeMinutes,
    });

    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;