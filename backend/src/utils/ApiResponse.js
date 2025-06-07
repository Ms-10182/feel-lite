class ApiResponse{
    constructor(statusCode, data, message){
        this.statusCode = statusCode
        
        // If data is an object, spread its properties directly into the response
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            Object.assign(this, data)
        } else {
            // For arrays or primitives, keep the data property
            this.data = data
        }
        
        
        // If data is an object, spread its properties directly into the response
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            Object.assign(this, data)
        } else {
            // For arrays or primitives, keep the data property
            this.data = data
        }
        
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }