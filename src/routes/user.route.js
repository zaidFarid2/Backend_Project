import { Router } from "express";
import { updateRefreshToken, userLogin, userLogout, userRegister } from "../controllers/user.controller.js";
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
userRouter.route("/refresh-token").post(updateRefreshToken)
    


export default userRouter

