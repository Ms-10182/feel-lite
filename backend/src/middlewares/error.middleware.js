import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

const errorHandler = (err, req, res, next) => {
    console.error("Error: ", err);

    // Handle API Errors (our custom errors)
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    }

    // Handle Mongoose Validation Errors
    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors
        });
    }

    // Handle Mongoose CastError (Invalid ID)
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID Format",
            errors: [err.message]
        });
    }

    // Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate ${field}`,
            errors: [`${field} already exists`]
        });
    }

    // Handle JWT Errors
    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            errors: [err.message]
        });
    }

    // Handle Multer File Size Error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: "File too large",
            errors: ["File size should be less than 5MB"]
        });
    }

    // Handle Request Entity Too Large Error
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: "Request entity too large",
            errors: ["Request body/file is too large"]
        });
    }

    // Handle Rate Limit Error
    if (err.type === 'too-many-requests') {
        return res.status(429).json({
            success: false,
            message: "Too many requests",
            errors: ["Please try again later"]
        });
    }

    // Handle Unknown/Unexpected Errors
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        errors: [process.env.NODE_ENV === 'development' ? err.message : "Something went wrong"]
    });
};

export { errorHandler };
