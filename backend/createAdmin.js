import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function createFirstAdmin() {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_PHONE) {
      console.error("Set ADMIN_EMAIL, ADMIN_PHONE and ADMIN_PASSWORD in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("An admin already exists. Nothing to do.");
      process.exit(0);
    }

    await User.create({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      area: "Model Town",
      address: "Bitezone HQ",
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
    });

    console.log("First admin created:", ADMIN_EMAIL);
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

createFirstAdmin();