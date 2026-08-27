import Counter from "../models/Counter.js";

export async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { name: "orderNumber" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return `BZ-${String(counter.value).padStart(5, "0")}`;
}