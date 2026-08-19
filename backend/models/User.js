import mongoose from "mongoose";
const userSchema=new mongoose.Schema(
        {
            name:{type:String,required:true},
            email:{type:String,unique:true,required:true},
            phone:{type:String,unique:true,required:true, minlength:11, maxlength:13},
            password:{type:String, required:true, minlength:8},
            role:{type:String, enum:["customer","admin"], default: "customer" },}, 
            { timestamps: true }

    );
    const User=mongoose.model("User",userSchema);
    export default User;