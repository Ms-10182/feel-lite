import mongoose, { Schema } from "mongoose";

const threadSchema = new mongoose.Schema({
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    content:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Thread = mongoose.model("Thread",threadSchema)