import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    area: { type: String, required: true },
    deliveryCharge: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Out for delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
    deliveryAddress: { type: String, required: true },
    estimatedDeliveryTime: { type: Date },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    prepTimeMinutes: { type: Number, default: 15 },       // snapshot used for this order's ETA
    queueDelayMinutes: { type: Number, default: 0 },       // snapshot of queue delay at creation
    adjustmentMinutes: { type: Number, default: 0 },       // admin manual delay buffer (edge cases)
    autoManaged: { type: Boolean, default: true },         // false once admin manually sets status
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;