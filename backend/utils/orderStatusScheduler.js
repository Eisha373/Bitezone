import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { getIO } from "./sockets.js";

const DELIVERY_BUFFER_MIN = 15; 

function getExpectedStatus(order) {
  const elapsedMin = (Date.now() - order.createdAt.getTime()) / 60000;
  const prepEnd = order.prepTimeMinutes + order.queueDelayMinutes + order.adjustmentMinutes;
  const deliveryEnd = prepEnd + DELIVERY_BUFFER_MIN;

  if (elapsedMin < prepEnd) return "Preparing";
  if (elapsedMin < deliveryEnd) return "Out for delivery";
  return "Out for delivery"; // Delivered stays a manual/rider-confirmed action
}

const STATUS_ORDER = ["Pending", "Preparing", "Out for delivery", "Delivered"];

function isForwardMove(current, next) {
  return STATUS_ORDER.indexOf(next) > STATUS_ORDER.indexOf(current);
}

export async function runStatusAutoAdvance() {
  const activeOrders = await Order.find({
    status: { $in: ["Pending", "Preparing", "Out for delivery"] },
    autoManaged: true,
  });

  const io = getIO();

  for (const order of activeOrders) {
    const expected = getExpectedStatus(order);

    if (isForwardMove(order.status, expected)) {
      order.status = expected;
      order.statusHistory.push({ status: expected, changedAt: new Date() });
      await order.save();

      io.to(`order:${order._id}`).emit("orderUpdate", {
        status: order.status,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        statusHistory: order.statusHistory,
      });

      const NOTIFY_STATUSES = ["Preparing", "Out for delivery"];
      if (NOTIFY_STATUSES.includes(expected)) {
        const notif = await Notification.create({
          user: order.customer,
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: expected,
          message: `Order ${order.orderNumber} is now ${expected}.`,
        });
        io.to(`user:${order.customer.toString()}`).emit("notification", notif);
      }
    }
  }
}