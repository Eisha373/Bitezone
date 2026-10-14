import express from "express"; 
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken"; 
import crypto from "crypto";
import User from "../models/User.js";
import { DELIVERY_ZONES } from "../data/deliveryZones.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router(); 

router.post("/signup", async (req, res) => {
  try {
const { name, email, phone, area, address, password } = req.body;
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email already registered" });
    }
const phoneExist = await User.findOne({ phone });
    if (phoneExist) {
      return res.status(400).json({ message: "Phone number already registered" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      area,
      address,
      password: hashedPassword,
      role: "customer",
    });
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    return res.status(201).json({
      message: "Registration Successful!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone:newUser.phone,
        area:newUser.area,
        address:newUser.address,
        role: newUser.role,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

router.post("/login", async (req, res)=>{
    try{
      const {email,password}=req.body;
      const user=await User.findOne({email});
      if(!user){
        return res.status(400).json({message:"Invalid email or password"});
      }
      const match=await bcrypt.compare(password,user.password);
      if(!match){
        return res.status(400).json({message:"Invalid email or password"});
      }
      const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone:user.phone,
        area:user.area,
        address:user.address,
        role: user.role,
      },
    });
  } 
     
    catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save( {validateBeforeSave: false});

    res.status(200).json({
      message: "Reset token generated",
      resetToken,
    });
  } catch (e){
    res.status(500).json({ message: e.message });
  }
});
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false});

    res.status(200).json({ message: "Password reset successful" });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/profile", verifyToken, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
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

    res.json({
      message: "Profile updated",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        area: updatedUser.area,
        address: updatedUser.address,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }

    const user = await User.findById(req.user.id);
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
const ADMIN_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const getMaxAdmins = () => Number(process.env.MAX_ADMINS) || 3;

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
    if (!DELIVERY_ZONES[area]) {
      return res.status(400).json({ message: "Invalid delivery area" });
    }
    if (!ADMIN_PASSWORD_PATTERN.test(password)) {
      return res.status(400).json({
        message: "Password must be 8+ characters with uppercase, lowercase, number & special character",
      });
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