import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";



const verifyJWt = asyncHandler( async(req,_,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401,"unauthorize request")
        }
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Invalid access token")
    
        }
        req.user = user
    
        next()
        
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token") 
    }
} )

export {verifyJWt}