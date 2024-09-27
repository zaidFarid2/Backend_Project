import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
const createRefreshAndAccessToken = async(userId)=>{
    try {
        const user  = await User.findById(userId)
        // console.log(user)
        const accesssToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        console.log(user)
        return {refreshToken,accesssToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh or access Token ")
    }
}

const userRegister = asyncHandler( async (req,res)=>{
    
    
    //user details from frontend
    const {email,fullName,username,password} = req.body 
    // console.log(`email:${email}${password}`)
    
    // validation like empty field
    if(
        [email,password,username,fullName].some( (field)=>field.trim() === "" ) 
    ){
        throw new ApiError(400,"All Fiels are required")   
    }
    

    
    //check user already existed with {username or emial}
    const existedUser = await User.findOne({
        $or:[{ username },{ email }]
        
    })
    
    if(existedUser){
        throw new ApiError(409,"User is already exist with username or Email ")
    }
    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path
    // console.log(avatarLocalPath)
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    
    //check for avatar / images
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    console.log(avatarLocalPath,"bhai path agaya")



        //upload them on cloudinary, cross check for avatr
    const avatar  = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }


    
    
    //create user object - create entry in db
    //remove password and refresh token field from response
    //return response 
    const  user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    const UserCreated =  await User.findById(user._id).select(
        "-password -refreshToken" 
    )
    if(!UserCreated){
        throw new ApiError(500,"something went wrong while registration")
    }
    return res.status(201).json(
        new ApiResponse(200,UserCreated,"user register successfully")
    )



})

// LOGINUSER
const userLogin = asyncHandler( async (req,res)=>{
    
    // collect data
    // email,username,password
    const {email,password,username } =  req.body
    
    if(!(email || username)){
        throw new ApiError(400,"email or username is required")
    }

    //user existed with this email
    const user =  await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(400,"user does'nt exist")
        
    }

    console.log(typeof password)

     // password check
    const validPassword = await user.isPasswordCorrect(password)
    if(!validPassword){
        throw new ApiError(401,"Invalid User Credentials")
    }

    console.log(validPassword)
    
    // create refresh and access token 
    const {accesssToken,refreshToken} = await createRefreshAndAccessToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // cookies send 

    const option = {
        httpOnly:true,
        secure:true,
    }
    return res.status(200)
    .cookie("accessToken",accesssToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(200,{user:loggedInUser,accesssToken,refreshToken}, "User logged In successfully")
    )
})

// UserLogout
const userLogout = asyncHandler(async (req,res)=>{
    const user  = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1 // this remove field form db
            },
            new:true
        }
    )

    const option = {
        httpOnly:true,
        secure:true,
    }
    return res.status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200,{},"User Logged out ")
    )

}) 


// UpdateRefreshToken

const updateRefreshToken = asyncHandler( async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken   
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    // verify token from environment variable
    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        console.log(decodedRefreshToken)
    
        const user  = await User.findById(decodedRefreshToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
    
        // check incoming token from  user and  existed user  in database 
        if(incomingRefreshToken  !== user?._refreshToken ){
            console.log(typeof user.refreshToken,user.refreshToken)
            console.log(typeof incomingRefreshToken,incomingRefreshToken)
            throw new ApiError("401","Refresh Token is expired or used")
        }   
        const option = {
            httpOnly:true,
            secure:true
        }
        const {accesssToken, newRefreshToken} = await createRefreshAndAccessToken(user._id) 
    
        res.status(200)
        .cookie("access Token",accesssToken)
        .cookie("refresh Token",newRefreshToken)
        .json(
            new ApiResponse(200,{accesssToken,newRefreshToken},"Token Redfreshed")
        )
    } catch (error) {
        throw new ApiError(401,error?.message|| "Invalid refresh Token")
    }



})


const  changeCurrentPassword = asyncHandler( async (req,res)=>{

    const  {oldPassword,newPassword } = req.body
    console.log(newPassword,oldPassword) 
    // db query find a user
    const user = await User.findById(req.user?._id)
    // check password ehich is define in models
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError("400","Invalid old Password")
    }
    // set new password and save in db
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password changed Successfully")
    )

})

const getCurrentUser = asyncHandler( async (req,res) =>{
    const user = await User.findById(req.user?._id)
    return res
    .status(200)
    .json(
        new ApiResponse(200,{user},"Current user fetched Accomplished")
    )



})

const updateUserDetails = asyncHandler( async (req,res)=>{
    const {email,fullName} = req.body
    if(!(email || fullName )){
        throw new ApiError(400,"All fields are required")
    }
    const user  = User.findByIdAndUpdate(req.user?._id,{$set: {email:email,fullName :fullName} },{new:true}).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,{user},"User details  updated Seamlessly "))

})

const updateUserAvatar = asyncHandler( async (req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar path is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uplaoding avatar")
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set :{avatar:avatar.url}
    },
    {new:true}
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar updated acomplished"))
}) 

const updateUsercoverImage = asyncHandler( async (req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage path is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"Error while uplaoding coverImage")
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set :{coverImage:coverImage.url}
    },
    {new:true}
    ).select("-password")
    
    return res
    .status(200)
    .json(new ApiResponse(200,user,"coverImage updated acomplished"))
}) 

const getUserChannelProfile = asyncHandler( async(req,res)=>{

    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    const channel =  await User.aggregate([{
        $match:{ //used to filter documents in a pipeline by specific conditions 
            username :username?.toLowerCase()
        },
        // mongo pipeline aggregation for finding subscriber
        $lookup:{
            from:"subscriptions",
            localField: "_id",
            foreignField:"channel",
            as: "subscribers"

        },

        // mongo pipeline aggregation for finding How many channels have I subscribed to
        $lookup:{
            from:"subscriptions",
            localField: "_id",
            foreignField:"subscriber",
            as: "subscribedTo"

        },

        // add fiels of subscriber and subribedTo also count wth size methd
        $addFields:{
            subscribersCount:{
                $size:"$subscribers"
            },
            channelsSubscribesToCount:{
                $size:"$subscribedTo"
            },
            isSubscribed:{
                 //this is follow buton like you subscribe channel or not
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        },
        $project:{
            fullName:1,
            username:1,
            subscribersCount:1,
            channelsSubscribesToCount:1,
            isSubscribed:1,
            email:1,
            coverImage:1

            

        }



    }])

    if(!channel?.length){
        throw new ApiError(400,"channel does not exists")

    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"User channel fetched effectively")
    )


})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user  = await User.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(req.user._id)   //we use mongoose types for id bcause mongoose not work in aggregation pipeline
            },
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as: "watchHistory",
                pipeline:[ //nested piprline bacause there is nothing id in owner field
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as: "owner"
                        },
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    },{
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]

            }

        }
    ])
    //want to console user 
    res
    .status(200)
    .json(
        ApiResponse(200,user[0].getWatchHistory,"Watch hisytory fetched seamlessly ")
    )


})





export { 
    userRegister,
    userLogin,
    userLogout,
    updateRefreshToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory
    
}