const mongoose = require("mongoose");

// Create Schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Post category is required"],
    },
    numViews: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post author is required"],
    },
    photo: {
      type: String,
      //required: [true, "Please Author is Required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual field: count post views
postSchema.virtual("viewsCount").get(function () {
  return Array.isArray(this.numViews) ? this.numViews.length : 0;
});

// Add likes Count as virtual field
postSchema.virtual("likesCount").get(function () {
  return Array.isArray(this.likes) ? this.likes.length : 0;
});

// Add dislikes Count as virtual field
postSchema.virtual("dislikesCount").get(function () {
  return Array.isArray(this.dislikes) ? this.dislikes.length : 0;
});

// Check the most liked post in percentages
postSchema.virtual("likesPercentage").get(function () {
  const post = this;

  const total = post.likes.length + post.dislikes.length;

  if (total === 0) {
    return "0%";
  }

  const percentage = (post.likes.length / total) * 100;

  return `${Math.round(percentage)}%`;
});

// Check the most disliked post in percentages
postSchema.virtual("dislikesPercentage").get(function () {
  const post = this;

  const total = post.likes.length + post.dislikes.length;

  if (total === 0) {
    return "0%";
  }

  const percentage = (post.dislikes.length / total) * 100;

  return `${Math.round(percentage)}%`;
});

// Calculate how long ago the post was created
postSchema.virtual("daysAgo").get(function () {
  const post = this;

  const date = new Date(post.createdAt);
  const millisecondsPerDay = 86400000;

  const daysAgo = Math.floor(
    (Date.now() - date.getTime()) / millisecondsPerDay,
  );

  if (daysAgo <= 0) {
    return "Today";
  }

  if (daysAgo === 1) {
    return "Yesterday";
  }

  return `${daysAgo} days ago`;
});

// Compile model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
