import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { DELIVERY_ZONES } from "../data/deliveryZones.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const PASSWORD_MSG =
  "Password must be 8+ characters with uppercase, lowercase, number & special character";
const PHONE_PATTERN = /^03\d{9}$/;
const getMaxAdmins = () => Number(process.env.MAX_ADMINS) || 3;
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

function publicUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    area: u.area,
    address: u.address,
    role: u.role,
  };
}

/* ===================== SIGNUP ===================== */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, area, address, password } = req.body;

    if (!name || !email || !phone || !area || !address?.trim() || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!PHONE_PATTERN.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 11-digit phone number" });
    }
    if (!DELIVERY_ZONES[area]) {
      return res.status(400).json({ message: "Invalid delivery area" });
    }
    if (!PASSWORD_PATTERN.test(password)) {
      return res.status(400).json({ message: PASSWORD_MSG });
    }

    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const phoneExist = await User.findOne({ phone });
    if (phoneExist) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    const newUser = await User.create({
      name,
      email,
      phone,
      area,
      address: address.trim(),
      password: await bcrypt.hash(password, 10),
      role: "customer", // role kabhi request se nahi aata
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registration Successful!",
      token,
      user: publicUser(newUser),
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/* ===================== LOGIN ===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ===================== FORGOT / RESET PASSWORD ===================== */
router.post("/forgot-password", async (req, res) => {
  const genericMsg = "If this email is registered, a reset link has been sent.";
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    // Same jawab chahe email registered ho ya na ho
    if (!user) {
      return res.status(200).json({ message: genericMsg });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(resetToken); // DB mein sirf hash
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const link = `${process.env.CLIENT_URL_PUBLIC}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"Bitezone" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your Bitezone password",
      html: `<p>Hi ${user.name},</p>
             <p>Click the link below to reset your password. It expires in 15 minutes.</p>
             <p><a href="${link}">Reset password</a></p>
             <p>If you didn't request this, you can ignore this email.</p>`,
    });

    return res.status(200).json({ message: genericMsg });
  } catch (e) {
    console.error("forgot-password error:", e.message);
    return res
      .status(500)
      .json({ message: "Could not send reset email. Try again later." });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || !PASSWORD_PATTERN.test(password)) {
      return res.status(400).json({ message: PASSWORD_MSG });
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(req.params.token),
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Password reset successful" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/* ===================== PROFILE ===================== */
router.patch("/profile", verifyToken, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    if (!PHONE_PATTERN.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 11-digit phone number" });
    }

    const phoneExist = await User.findOne({ phone, _id: { $ne: req.user.id } });
    if (phoneExist) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { phone },
      { new: true, runValidators: true }
    );

    res.json({ message: "Profile updated", user: publicUser(updatedUser) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }
    if (!PASSWORD_PATTERN.test(newPassword)) {
      return res.status(400).json({ message: PASSWORD_MSG });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save({ validateBeforeSave: false });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================== ADMIN MANAGEMENT ===================== */
router.post("/create-admin", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, area, address, password } = req.body;
    const maxAdmins = getMaxAdmins();

    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount >= maxAdmins) {
      return res.status(403).json({
        message: `Admin limit reached (${maxAdmins}). Remove an admin before adding a new one.`,
      });
    }

    if (!name || !email || !phone || !area || !address?.trim() || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!PHONE_PATTERN.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 11-digit phone number" });
    }
    if (!DELIVERY_ZONES[area]) {
      return res.status(400).json({ message: "Invalid delivery area" });
    }
    if (!PASSWORD_PATTERN.test(password)) {
      return res.status(400).json({ message: PASSWORD_MSG });
    }

    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      return res.status(400).json({ message: "Email or phone already registered" });
    }

    const admin = await User.create({
      name,
      email,
      phone,
      area,
      address: address.trim(),
      password: await bcrypt.hash(password, 10),
      role: "admin",
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Admin created",
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/admins", verifyToken, isAdmin, async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email phone createdAt createdBy")
      .sort({ createdAt: 1 })
      .populate("createdBy", "name email");

    const list = admins.map((a, i) => ({ ...a.toObject(), isOwner: i === 0 }));
    res.json({ admins: list, maxAdmins: getMaxAdmins() });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/admins/:id/demote", verifyToken, isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot remove your own admin access" });
    }
    const owner = await User.findOne({ role: "admin" }).sort({ createdAt: 1 }).select("_id");
    if (owner && owner._id.toString() === req.params.id) {
      return res.status(400).json({ message: "The owner admin cannot be removed" });
    }
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(400).json({ message: "Cannot remove the last admin" });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: "admin" },
      { role: "customer" },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin demoted to customer" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;