import mongoose,{model, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema =new mongoose.Schema(
    {
        videoFile:{
            type:String,  //cloudinary
            required:true,    
        },
        thumbnail:{
            type:String,  //cloudinary
            required:true,    
        },
        tittle:{
            type:String,  
            required:true,    
        },
        discription:{
            type:String, 
            required:true,    
        },
        duration:{
            type:Number,  //cloudinary
            required:true,    
        },
        views:{
            type:Number, 
            default:0,    
        },
        isPublish:{
            Boolean:true, 
            default:true,    
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    }
,{timestamps:true}) 
export const Video = mongoose.model("Video",videoSchema)
