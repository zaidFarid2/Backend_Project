const asyncHandler = (requestHandler)=>(req,res,next)=>{
    return Promise
    .resolve(requestHandler(req,res,next))
    .catch((error)=>{
        next(error) 
    })
}




export { asyncHandler}



// asyncHandler with the help of try Catch method



// const asyncHandler = (fn)=>async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//     res.status(error.code||500).json({
//         success:false,
//         message:error.message       
//     })
// }

// }

// const asyncHandler1 =  (fn) => async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code).json({
//             success:false,
//             message:error.message
//         })
//     }
// }



// const asyncHandler1 = (requestHandler1)=>(req,res,next)=>{
//      Promise()
//     .resolve(
//         requestHandler1(req,res,next)
//     ).reject((error)=>{
//         next()
//     })
// }










