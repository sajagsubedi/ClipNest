class ApiResponse {
    constructor(statusCode, data, message = "Suuccess !"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }