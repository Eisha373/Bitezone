import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { DELIVERY_ZONES } from "../data/deliveryZones.js";


const router = express.Router();


router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, area, deliveryAddress } = req.body;

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      subtotal += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const deliveryCharge = DELIVERY_ZONES[area] || 0;
    const totalAmount = subtotal + deliveryCharge;

    const newOrder = await Order.create({
      customer: req.user.id,
      items: orderItems,
      area,
      deliveryCharge,
      totalAmount,
      deliveryAddress,
    });

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/my", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).populate("items.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate("customer", "name email").populate("items.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/stats/summary", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "Pending" });

    const allOrders = await Order.find();
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({ totalOrders, totalRevenue, pendingOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.patch("/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;