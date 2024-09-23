class ApiError extends Error{
    constructor(statusCode,message="something went wrong",errors=[],stack= ""){
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.errors = errors
        this.data  =  null
        this.success  =  false

        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError }


// class ApiError1 extends Error{
//     constructor(statusCode,message ="kch to Garbar he",errors =[],stacks= ""){
//         super(message)
//         this.message = message 
//         this.statusCode = statusCode 
//         this.errors = errors 
//         this.stacks = stacks 
//     }
//     if(stacks){
//         this.stacks = stacks 
        
//     }else{

//     }
// }