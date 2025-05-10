import mongoose from "mongoose";

const bookmarkedPostSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    bookmark: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bookmark",
    },
  },
  { timestamps: true }
);

export const BookmarkedPost = mongoose.model(
  "BookmarkedPost",
  bookmarkedPostSchema
);
