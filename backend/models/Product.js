import mongoose from "mongoose";


const productSchema=new mongoose.Schema(
        {
            name:{type:String,required:true},
            description: { type: String },
            imageLink: { type: String, required: true },
            category: { type: String, enum: ["pizza", "burger", "nuggets","sandwich", "fries", "pasta"], required: true },},  
            { timestamps: true });

    const Product=mongoose.model("Product",productSchema);
        
  export default Product;  