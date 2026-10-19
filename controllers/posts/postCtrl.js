const User = require("../../model/User/User");
const Post = require("../../model/Post/Post");
const { appErr } = require("../../utils/appErr");

// CREATE
const postCreatedCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;

  try {
    const author = await User.findById(req.userAuth);

    if (!author) {
      return next(appErr("User not found", 404));
    }

    if (author.isBlocked) {
      return next(appErr("Access denied, Account blocked", 403));
    }

    const post = await Post.create({
      title,
      description,
      category,
      user: author._id,
    });

    author.posts.push(post._id);
    await author.save();

    return res.status(201).json({
      status: "Success",
      data: post,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// Togglelike
const toggleLikesPostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    //2. Check if the user has already likedthe post
    const isLiked = post.likes.includes(req.userAuth);
    //3. If the user has already liked the post, unlike the post
    if (isLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== req.userAuth.toString(),
      );
      await post.save();
    } else {
      //4. If the user has liked the post
      post.likes.push(req.userAuth);
      await post.save();
    }

    res.json({
      status: "Success",
      data: "You Have Successfully Like the Post",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// ToggleDislike
const toggleDislikesPostCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    //2. Check if the user has already Disiked the post
    const isUnliked = post.dislikes.includes(req.userAuth);
    //3. If the user has already liked the post, unlike the post
    if (isUnliked) {
      post.dislikes = post.dislikes.filter(
        (dislike) => dislike.toString() !== req.userAuth.toString(),
      );
      await post.save();
    } else {
      //4. If the user has Disliked the post
      post.dislikes.push(req.userAuth);
      await post.save();
    }

    res.json({
      status: "Success",
      data: "You Have Successfully Disiked the Post",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// SINGLE
const postSingleCtrl = async (req, res, next) => {
  try {
    // Find the post
    const post = await Post.findById(req.params.id);

    // Check whether the post exists
    if (!post) {
      return res.status(404).json({
        status: "Failed",
        message: "Post not found",
      });
    }

    // Check whether numViews is an array
    if (!Array.isArray(post.numViews)) {
      post.numViews = [];
    }

    // Check whether the user has viewed the post
    const isViewed = post.numViews.some(
      (userId) => userId.toString() === req.userAuth.toString(),
    );

    // Record the user's view if it is new
    if (!isViewed) {
      post.numViews.push(req.userAuth);
      await post.save();
    }

    // Return the post
    return res.status(200).json({
      status: "Success",
      data: post,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// ALL
const fetchPostCtrl = async (req, res, next) => {
  try {
    //Find all posts
    const posts = await Post.find({})
      .populate("user")
      .populate("category", "title");

    //Check if the user is blocked by the post owner
    const filteredPosts = posts.filter((post) => {
      //Get all blocked users
      const blockedUsers = post.user.blocked;
      const isBlocked = blockedUsers.includes(req.userAuth);

      return !isBlocked;
    });

    return res.json({
      status: "Success",
      data: filteredPosts,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// DELETE
const postDeleteCtrl = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only author can delete
    if (post.user.toString() !== req.userAuth.toString()) {
      return res
        .status(403)
        .json({ message: "You are NOT authorized to delete this post" });
    }

    await post.deleteOne();

    // Remove post ID from user.posts
    await User.findByIdAndUpdate(req.params.id);

    return res.json({
      status: "success",
      message: "Post deleted Successfully",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// UPDATE

const postUpdateCtrl = async (req, res, next) => {
  try {
    // Prevent destructuring undefined
    const { title, description, category } = req.body || {};

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: "Failed",
        message: "Post not found",
      });
    }

    // Only the author can update the post
    if (post.user.toString() !== req.userAuth.toString()) {
      return res.status(403).json({
        status: "Failed",
        message: "You are not authorized to update this post",
      });
    }

    // Update only fields provided
    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (category !== undefined) post.category = category;

    // Update photo only when a new image is uploaded
    if (req.file) {
      post.photo = req.file.path;
    }

    const updatedPost = await post.save();

    return res.status(200).json({
      status: "Success",
      message: "Post Updated Successfully",
      data: updatedPost,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

module.exports = {
  postCreatedCtrl,
  postSingleCtrl,
  postDeleteCtrl,
  postUpdateCtrl,
  fetchPostCtrl,
  toggleLikesPostCtrl,
  toggleDislikesPostCtrl,
};
