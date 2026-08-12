import express from "express"; 
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken"; 
import User from "../models/User.js";

const router = express.Router(); 

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "customer",
    });

    return res.status(201).json({ message: "Registration Successful!", userId: newUser._id });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

export default router;