const mongoose = require("mongoose");
const Post = require("../Post/Post");

// ================= CREATE SCHEMA =================

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
    },

    lastname: {
      type: String,
      required: [true, "Last name is required"],
    },

    profilePhoto: {
      type: String,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["Admin", "Guest", "Editor"],
      default: "Guest",
    },

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    userAward: {
      type: String,
      enum: ["Gold", "Silver", "Bronze"],
      default: "Bronze",
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// =====================================================
// ====================== HOOKS ========================
// =====================================================

userSchema.pre("findOne", async function (next) {
  //populate the post
  this.populate({
    path: "posts",
  });
  try {
    // -------------------------------------------------
    // 1. GET USER ID
    // -------------------------------------------------

    const userId = this.getQuery()._id;

    if (!userId) {
      return next();
    }

    // -------------------------------------------------
    // 2. GET ALL POSTS CREATED BY USER
    // -------------------------------------------------

    const posts = await Post.find({
      user: userId,
    });

    // -------------------------------------------------
    // 3. COUNT USER POSTS
    // -------------------------------------------------

    const numberOfPosts = posts.length;

    // -------------------------------------------------
    // 4. CALCULATE USER AWARD
    // -------------------------------------------------

    let userAward;

    if (numberOfPosts < 10) {
      userAward = "Bronze";
    } else if (numberOfPosts <= 20) {
      userAward = "Silver";
    } else {
      userAward = "Gold";
    }

    // -------------------------------------------------
    // 5. UPDATE USER AWARD
    // -------------------------------------------------

    await mongoose.model("User").findByIdAndUpdate(userId, {
      userAward: userAward,
    });

    // -------------------------------------------------
    // 6. FIND MOST RECENT POST
    // -------------------------------------------------

    const lastPost = await Post.findOne({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    // -------------------------------------------------
    // 7. USER HAS NO POSTS
    // -------------------------------------------------

    if (!lastPost) {
      console.log("User has no posts");

      return next();
    }

    // -------------------------------------------------
    // 8. GET LAST POST DATE
    // -------------------------------------------------

    const lastPostDate = new Date(lastPost.createdAt);

    // -------------------------------------------------
    // 9. GET CURRENT DATE
    // -------------------------------------------------

    const currentDate = new Date();

    // -------------------------------------------------
    // 10. CALCULATE DIFFERENCE
    // -------------------------------------------------

    const diff = currentDate - lastPostDate;

    // -------------------------------------------------
    // 11. CONVERT DIFFERENCE TO DAYS
    // -------------------------------------------------

    const diffInDays = diff / (1000 * 60 * 60 * 24);

    // -------------------------------------------------
    // 12. CHECK IF USER IS INACTIVE
    // -------------------------------------------------

    if (diffInDays > 30) {
      await mongoose.model("User").findByIdAndUpdate(userId, {
        isBlocked: true,
      });

      console.log("User blocked because of inactivity.");
    } else {
      await mongoose.model("User").findByIdAndUpdate(userId, {
        isBlocked: false,
      });

      console.log("User is active.");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// =====================================================
// ===================== VIRTUALS ======================
// =====================================================

// -----------------------------------------------------
// FULL NAME
// -----------------------------------------------------

userSchema.virtual("fullname").get(function () {
  return `${this.firstname} ${this.lastname}`;
});

// -----------------------------------------------------
// INITIALS
// -----------------------------------------------------

userSchema.virtual("initials").get(function () {
  const f = this.firstname?.[0] || "";
  const l = this.lastname?.[0] || "";

  return `${f}${l}`;
});

// -----------------------------------------------------
// POST COUNT
// -----------------------------------------------------

userSchema.virtual("postCounts").get(function () {
  return this.posts?.length || 0;
});

// -----------------------------------------------------
// FOLLOWERS COUNT
// -----------------------------------------------------

userSchema.virtual("followersCount").get(function () {
  return this.followers?.length || 0;
});

// -----------------------------------------------------
// FOLLOWING COUNT
// -----------------------------------------------------

userSchema.virtual("followingCount").get(function () {
  return this.following?.length || 0;
});

// -----------------------------------------------------
// VIEWERS COUNT
// -----------------------------------------------------

userSchema.virtual("viewersCount").get(function () {
  return this.viewers?.length || 0;
});

// -----------------------------------------------------
// BLOCKED COUNT
// -----------------------------------------------------

userSchema.virtual("blockedCount").get(function () {
  return this.blocked?.length || 0;
});

// =====================================================
// ==================== LAST POST =======================
// =====================================================

userSchema.virtual("lastPostDate").get(function () {
  if (!this.posts || this.posts.length === 0) {
    return "No posts";
  }

  return this.updatedAt ? this.updatedAt.toDateString() : "No posts";
});

// =====================================================
// ===================== INACTIVE ======================
// =====================================================

userSchema.virtual("isInactive").get(function () {
  if (!this.updatedAt) {
    return false;
  }

  const currentDate = new Date();

  const diff = currentDate - this.updatedAt;

  const diffInDays = diff / (1000 * 60 * 60 * 24);

  return diffInDays > 30;
});

// =====================================================
// ==================== LAST ACTIVE =====================
// =====================================================

userSchema.virtual("lastActive").get(function () {
  if (!this.updatedAt) {
    return "Never";
  }

  const currentDate = new Date();

  const diff = currentDate - this.updatedAt;

  const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffInDays <= 0) {
    return "Today";
  }

  if (diffInDays === 1) {
    return "Yesterday";
  }

  return `${diffInDays} days ago`;
});

// =====================================================
// ====================== MODEL =========================
// =====================================================

const User = mongoose.model("User", userSchema);

module.exports = User;
