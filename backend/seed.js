import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const products = [
  { name: "Patty Burger", price: 350, imageLink: "/images/patty burger.jpeg", category: "burger" },
  { name: "Fajita Pizza", price: 1000, imageLink: "/images/fajita pizza.jpg", category: "pizza" },
  { name: "Grilled Sandwich", price: 450, imageLink: "/images/Grilled-Chicken-Sandwich.jpg", category: "sandwich" },
  { name: "Creamy Pasta", price: 900, imageLink: "/images/creamy-chicken-and-mushroom-pasta.jpg", category: "pasta" },
  { name: "Nuggets", price: 500, imageLink: "/images/nuggets.jpeg", category: "nuggets" },
  { name: "Loaded Fries", price: 600, imageLink: "/images/loaded fries.jpeg", category: "fries" },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    await Product.deleteMany({});
    console.log("Old products removed");

    await Product.insertMany(products);
    console.log("Dummy products inserted successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedProducts();