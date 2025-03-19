import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    post:{
        type:Schema.Types.ObjectId,
        ref:"Post"
    },
    content:{
        type:String,
        required:[true,"comment can't be empty"]
    }
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);
