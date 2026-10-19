const mongoose = require("mongoose");

//create Schema
const commentSchema = new mongoose.Schema(
  {
    post: {
      type: String,
      required: [true, "Post Title is required"],
      ref: "Post",
    },
    description: {
      type: String,
      required: [true, "Comment Description  is required"],
    },
    user: {
      type: Object,
      required: [true, "User is Required"],
    },
  },
  {
    timestamps: true,
  },
);

//Compile the Comment model
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
