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
        role: user.role,
      },
    });
  } 
     
    catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
export default router;
