import mongoose  from "mongoose";
const subscriptionSchema  = new mongoose.Schema({
    // one who is subscribing
    subscriber:{
            type:Schema.Types.ObjectId,
            ref:"User"
    },
    channel:{     //basically owner is also a user 
        type:Schema.Types.ObjectId,
        ref:"User"        
    }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)