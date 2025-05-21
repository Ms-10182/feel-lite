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
        
        this.message = message
        this.success = statusCode < 400
    }    // Utility method to convert response to a plain object with unwrapped data
    toUnwrappedJson() {
        const responseObj = { 
            statusCode: this.statusCode,
            message: this.message,
            success: this.success
        }

        // If this.data exists and is an object, spread its properties
        if (this.data && typeof this.data === 'object' && !Array.isArray(this.data)) {
            return { ...responseObj, ...this.data }
        }
        
        // Otherwise include the data property as is
        return { ...responseObj, data: this.data }
    }
}

export { ApiResponse }