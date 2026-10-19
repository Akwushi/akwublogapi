const Comment = require("../../model/Comment/Comment");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const { appErr } = require("../../utils/appErr");




//Created

const commentCreatedCtrl = async (req, res, next) => {
  try {
    const { description } = req.body || {};

    // Validate the comment description
    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        status: "Failed",
        message: "Comment description is required",
      });
    }

    // Find the post
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: "Failed",
        message: "Post not found",
      });
    }

    // Find the logged-in user
    const user = await User.findById(req.userAuth);

    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "User not found",
      });
    }

    // Create the comment
    const comment = await Comment.create({
      post: post._id,
      description: description.trim(),
      user: user._id,
    });

    // Add comment ID to the post
    post.comments.push(comment._id);

    // Add comment ID to the user
    user.comments.push(comment._id);

    // Save the post and user
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });

    return res.status(201).json({
      status: "Success",
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    return next(error);
  }
};

//Delete

const commentDeleteCtrl = async (req, res, next) => {
  try {
    // Find the comment by its ID
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        status: "Failed",
        message: "Comment not found",
      });
    }

    // Only the comment's author can delete it
    if (comment.user.toString() !== req.userAuth.toString()) {
      return res.status(403).json({
        status: "Failed",
        message: "You are not authorized to delete this comment",
      });
    }

    // Remove the comment reference from its post
    if (comment.post) {
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: comment._id },
      });
    }

    // Remove the comment reference from its user
    await User.findByIdAndUpdate(comment.user, {
      $pull: { comments: comment._id },
    });

    // Delete the comment
    await Comment.findByIdAndDelete(comment._id);

    return res.status(200).json({
      status: "Success",
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};


//Update

const commentUpdateCtrl = async (req, res, next) => {
  try {
    const { description } = req.body || {};

    // Validate the description
    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        status: "Failed",
        message: "Comment description is required",
      });
    }

    // Find the comment
    const comment = await Comment.findById(req.params.id);

    // Check whether the comment exists
    if (!comment) {
      return res.status(404).json({
        status: "Failed",
        message: "Comment not found",
      });
    }

    // Check whether the logged-in user owns the comment
    if (
      !comment.user ||
      comment.user.toString() !== req.userAuth.toString()
    ) {
      return res.status(403).json({
        status: "Failed",
        message: "You are not allowed to update this comment",
      });
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { description: description.trim() },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: "Success",
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    return next(error);
  }
};


module.exports = {
  commentCreatedCtrl,
  commentDeleteCtrl,
  commentUpdateCtrl,
};
