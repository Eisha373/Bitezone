import express from "express";
import Product from "../models/Product.js";

const router = express.Router(); 
router.get("/", async (req, res) =>{
try{
    const products=await Product.find();
    res.json(products);
}
catch(error){
 res.status(500).json({message:error.message});
}
});

router.get("/:id", async (req, res) =>{
    try{
    const idURL=req.params.id;
    const productId=await Product.findById(idURL);
    if(!productId){
        return res.status(404).json({message:"product not found"});
    }
    res.json(productId);

    }
    catch(e){
        res.status(500).json({message:e.message});
    }
});

export default router;