import mongoose from "mongoose";

const orderSchema=new mongoose.model(
    {
       customer:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User",
         required:true
       },
       items:[
        {
        product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
       },
       quantity:{type:Number,required:true,min:1},
       price:{type:Number,required:true}}],
     totalAmount:{type:Number,required:true,min:0},
     status:{
        type:String,enum:["Pending","Preparing","Delivered","Cancelled"],default:"Pending"
     },
     deliveryAddress:{type:String,required:true},},
     {timestamps:true});

     const Order=mongoose.model("Order",orderSchema);
     export default Order;