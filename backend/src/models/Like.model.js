import mongoose, { Schema } from "mongoose";

const likeSchema = new mongoose.Schema({
    post:{
        type:Schema.Types.ObjectId,
        ref:"Post"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        indexed:true
    }
},{timestamps:true})

export const Like = mongoose.model("Like", likeSchema);