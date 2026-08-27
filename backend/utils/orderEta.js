import Order from "../models/Order.js";

const BASE_ETA_MIN = 30;

// Tiered delay based on how many orders are currently active
function getDelayForActiveCount(activeCount) {
  if (activeCount <= 3) return 0;
  if (activeCount <= 7) return 10;
  return 20;
}

// Used when a new order is placed
export async function calculateEtaForNewOrder() {
  const activeCount = await Order.countDocuments({
    status: { $in: ["Pending", "Preparing"] },
  });

  const delay = getDelayForActiveCount(activeCount);
  const eta = new Date(Date.now() + (BASE_ETA_MIN + delay) * 60 * 1000);

  return { estimatedDeliveryTime: eta, activeCount, delay };
}

// Called whenever the active queue size changes (new order placed,
// or an order becomes Delivered/Cancelled) — recalculates ETA for
// all still-active orders and returns the updated docs so routes
// can broadcast them via socket.
export async function recalcActiveOrdersEta() {
  const activeOrders = await Order.find({
    status: { $in: ["Pending", "Preparing"] },
  });

  const activeCount = activeOrders.length;
  const delay = getDelayForActiveCount(activeCount);

  const updated = [];
  for (const order of activeOrders) {
    const newEta = new Date(order.createdAt.getTime() + (BASE_ETA_MIN + delay) * 60 * 1000);
    await Order.updateOne(
      { _id: order._id },
      { $set: { estimatedDeliveryTime: newEta } }
    );
    order.estimatedDeliveryTime = newEta;
  
    updated.push(order);
  }

  return updated;
}