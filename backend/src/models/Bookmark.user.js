import mongoose, { Schema } from 'mongoose'

const bookmarkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    }
    
},{timestamps:true});

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);