import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        index:true,
        trim:true

    },
    email:{
    type:String,
        unique:true,
        required:true,
        lowerCase:true,
        trim:true,

    },
    fullName:{
        type:String,
        required:true,
        lowerCase:true,
        index:true,

    },
    avatar:{
        type:String,   //cloudinary url
        required:true,
    },
    coverImage:{
        type:String,   //cloudinary url
        required:true,
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,   //cloudinary url
        ref:"Video"
    }],
    password:{
        type:String,
        required:[true,"password is required"],
    },
    refreshToken:{
        type:String
    }



},{timestamps:true})



userSchema.pre("save",async function(next){  //bcz arrow fn ha not {this} access
    if(!this.isModified("password"))return next()
    this.password = await bcrypt.hash(this.password,10)
    next()

}) 

userSchema.methods.isPasswordCorrect =async function(password){
    return await bcrypt.compare(password,this.password )
}
//generate access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User",userSchema)