import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { DELIVERY_ZONES } from "../data/deliveryZones.js";
import { calculateEtaForNewOrder, recalcActiveOrdersEta } from "../utils/orderEta.js";
import { getIO } from "../utils/sockets.js";
import { getNextOrderNumber } from "../utils/getNextOrderNumber.js";
import Notification from "../models/Notification.js";

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

    const zone = DELIVERY_ZONES[area] || { charge: 0, driveMinutes: 15 };
    const deliveryCharge = zone.charge;
    const totalAmount = subtotal + deliveryCharge;

    const { estimatedDeliveryTime, prepTime, delay } = await calculateEtaForNewOrder(items, zone.driveMinutes);

    const orderNumber = await getNextOrderNumber();

    const newOrder = await Order.create({
      customer: req.user.id,
      orderNumber,
      items: orderItems,
      area,
      deliveryCharge,
      totalAmount,
      deliveryAddress,
      estimatedDeliveryTime,
      prepTimeMinutes: prepTime,
      queueDelayMinutes: delay,
      driveMinutes: zone.driveMinutes,
      statusHistory: [{ status: "Pending", changedAt: new Date() }],
    });

    const io = getIO();

    const placedNotif = await Notification.create({
      user: newOrder.customer,
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      status: "Pending",
      message: `Your order ${newOrder.orderNumber} has been placed successfully.`,
    });
    io.to(`user:${newOrder.customer.toString()}`).emit("notification", placedNotif);

    const admins = await User.find({ role: "admin" }).select("_id");
    for (const admin of admins) {
      const adminNotif = await Notification.create({
        user: admin._id,
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
        status: "Pending",
        message: `New order ${newOrder.orderNumber} has been placed.`,
      });
      io.to(`user:${admin._id.toString()}`).emit("notification", adminNotif);
    }

    const updatedOrders = await recalcActiveOrdersEta();
    updatedOrders.forEach((order) => {
      io.to(`order:${order._id}`).emit("orderUpdate", {
        status: order.status,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        statusHistory: order.statusHistory,
      });
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
      {
        status,
        autoManaged: false,
        $push: { statusHistory: { status, changedAt: new Date() } },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const io = getIO();

    if (status === "Delivered" || status === "Cancelled") {
      const updatedOrders = await recalcActiveOrdersEta();
      updatedOrders.forEach((order) => {
        io.to(`order:${order._id}`).emit("orderUpdate", {
          status: order.status,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          statusHistory: order.statusHistory,
        });
      });
    }

    io.to(`order:${updatedOrder._id}`).emit("orderUpdate", {
      status: updatedOrder.status,
      estimatedDeliveryTime: updatedOrder.estimatedDeliveryTime,
      statusHistory: updatedOrder.statusHistory,
    });

    const NOTIFY_STATUSES = ["Preparing", "Out for delivery", "Delivered", "Cancelled"];
    if (NOTIFY_STATUSES.includes(status)) {
      const statusNotif = await Notification.create({
        user: updatedOrder.customer,
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        message: `Order ${updatedOrder.orderNumber} is now ${updatedOrder.status}.`,
      });
      io.to(`user:${updatedOrder.customer.toString()}`).emit("notification", statusNotif);
    }

    res.json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/delay", verifyToken, isAdmin, async (req, res) => {
  try {
    const { minutes } = req.body;

    if (!minutes || minutes <= 0) {
      return res.status(400).json({ message: "Provide a positive number of minutes" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.adjustmentMinutes += minutes;
    order.estimatedDeliveryTime = new Date(
      order.estimatedDeliveryTime.getTime() + minutes * 60 * 1000
    );
    await order.save();

    const io = getIO();
    io.to(`order:${order._id}`).emit("orderUpdate", {
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      statusHistory: order.statusHistory,
    });

    const notif = await Notification.create({
      user: order.customer,
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      message: `Order ${order.orderNumber} delivery time updated — running about ${minutes} min behind.`,
    });
    io.to(`user:${order.customer.toString()}`).emit("notification", notif);

    res.json({ message: "Order delayed successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }
    if (order.status !== "Pending") {
      return res.status(400).json({ message: "This order can no longer be cancelled" });
    }

    order.status = "Cancelled";
    order.statusHistory.push({ status: "Cancelled", changedAt: new Date() });
    await order.save();

    const io = getIO();
    const updatedOrders = await recalcActiveOrdersEta();
    updatedOrders.forEach((o) => {
      io.to(`order:${o._id}`).emit("orderUpdate", {
        status: o.status,
        estimatedDeliveryTime: o.estimatedDeliveryTime,
        statusHistory: o.statusHistory,
      });
    });
    io.to(`order:${order._id}`).emit("orderUpdate", {
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      statusHistory: order.statusHistory,
    });

    const cancelNotif = await Notification.create({
      user: order.customer,
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: "Cancelled",
      message: `Order ${order.orderNumber} has been cancelled.`,
    });
    io.to(`user:${order.customer.toString()}`).emit("notification", cancelNotif);

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;