import Order from "../models/Order.js";
import Product from "../models/Product.js";

const DELIVERY_BUFFER_MIN = 15;

function getDelayForActiveCount(activeCount) {
  if (activeCount <= 3) return 0;
  if (activeCount <= 7) return 10;
  return 20;
}

// Prep happens in parallel per item, not sequentially — use the max, not the sum
async function getPrepTimeForItems(items) {
  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const prepTimes = products.map((p) => p.prepTimeMinutes ?? 15);
  return Math.max(...prepTimes, 15);
}

export async function calculateEtaForNewOrder(items) {
  const activeCount = await Order.countDocuments({
    status: { $in: ["Pending", "Preparing", "Out for delivery"] },
  });

  const delay = getDelayForActiveCount(activeCount);
  const prepTime = await getPrepTimeForItems(items);
  const totalMinutes = prepTime + DELIVERY_BUFFER_MIN + delay;
  const eta = new Date(Date.now() + totalMinutes * 60 * 1000);

  return { estimatedDeliveryTime: eta, activeCount, delay, prepTime };
}

export async function recalcActiveOrdersEta() {
  const activeOrders = await Order.find({
    status: { $in: ["Pending", "Preparing", "Out for delivery"] },
  }).populate("items.product");

  const activeCount = activeOrders.length;
  const delay = getDelayForActiveCount(activeCount);

  const updated = [];
  for (const order of activeOrders) {
    const prepTimes = order.items.map((i) => i.product?.prepTimeMinutes ?? 15);
    const prepTime = Math.max(...prepTimes, 15);
    const totalMinutes = prepTime + DELIVERY_BUFFER_MIN + delay + order.adjustmentMinutes;

    const newEta = new Date(order.createdAt.getTime() + totalMinutes * 60 * 1000);
    await Order.updateOne(
      { _id: order._id },
      { $set: { estimatedDeliveryTime: newEta, prepTimeMinutes: prepTime, queueDelayMinutes: delay } }
    );
    order.estimatedDeliveryTime = newEta;
    order.prepTimeMinutes = prepTime;
    order.queueDelayMinutes = delay;

    updated.push(order);
  }

  return updated;
}