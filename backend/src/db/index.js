import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect_DB =async()=>{
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("connection sucessfull, host:",connection.connection.host)
    } catch (error) {
        console.error("mongodb connection failed: ",error)
        process.exit(1);
    }
}

export {connect_DB}