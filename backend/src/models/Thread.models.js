import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
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

threadSchema.plugin(mongooseAggregatePaginate);

export const Thread = mongoose.model("Thread",threadSchema)
