class ApiResponse{
    constructor(statusCode,message = "success",data){
        this.message = message
        this.statusCode = statusCode<400
        this.data = data
    }
}

export { ApiResponse }