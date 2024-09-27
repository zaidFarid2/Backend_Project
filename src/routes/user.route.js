import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, updateRefreshToken, updateUserAvatar, updateUsercoverImage, updateUserDetails, userLogin, userLogout, userRegister } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWt } from "../middlewares/auth.middleware.js";
const userRouter = Router()



userRouter.route("/register").post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            }, 
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        userRegister
        )
userRouter.route("/login").post(userLogin)

// secure routes

userRouter.route("/logout").post(verifyJWt,userLogout)
userRouter.route("/refresh-token").patch(verifyJWt,updateRefreshToken)
userRouter.route("/change-password").post(verifyJWt,changeCurrentPassword)    
userRouter.route("/get-user").post(verifyJWt,getCurrentUser)
userRouter.route("/update-account").patch(verifyJWt,updateUserDetails)
userRouter.route("/avatar").patch(verifyJWt,upload.single("avatar"),updateUserAvatar)
userRouter.route("/coverImage").patch(verifyJWt,upload.single("coverImage"),updateUsercoverImage)
userRouter.route("/c/:username").get(verifyJWt,getUserChannelProfile)
userRouter.route("/history").get(verifyJWt,getWatchHistory)



export default userRouter

