import express from "express"; 
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken"; 
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router(); 

router.post("/signup", async (req, res) => {
  try {
const { name, email, phone, area, address, password, role } = req.body;
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
      role: role || "customer",
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
export default router;
