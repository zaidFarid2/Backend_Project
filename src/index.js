import {app} from "./app.js";
import dotenv from "dotenv";

import connectDB from "./db/index.js";


dotenv.config({
    path:"./env"
})



connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`server is running here ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log(`mongo DB connection failed!! ${error}`)
})



































// (async()=>{
//     try{
//         await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//         console.log({error:error})
//         throw error
//     })
//     app.listen(process.env.PORT,()=>{
//         console.log(`app is listening here ${process.env.PORT}`)
//     })
//     }catch(error){
//         console.log({error:"error",error})

//     }
// })()