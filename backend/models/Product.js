import mongoose from "mongoose";


const productSchema=new mongoose.Schema(
        {
            name:{type:String,required:true},
            price: { type: Number, required: true, min: 0 },
            description: { type: String },
            prepTimeMinutes: { type: Number, required: true, default: 15 },
            imageLink: { type: String, required: true },
            category: { type: String, enum: ["pizza", "burger", "nuggets","sandwich","shawarma", "fries", "pasta","desert","refreshment"], required: true },},  
            { timestamps: true });

    const Product=mongoose.model("Product",productSchema);
        
  export default Product;  