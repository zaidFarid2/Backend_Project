import mongoose from "mongoose";




const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`)
        console.log(`db connected!! DB host ${connectionInstance.connection.host }`)
    } catch (error) {
        console.log({message:"DB CONNECTION ERROR"})
    }
}

export default connectDB 