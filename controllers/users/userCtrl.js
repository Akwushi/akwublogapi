const bcrypt = require("bcryptjs");
const User = require("../../model/User/User");
const genToken = require("../../utils/genToken");
const getTokenHead = require("../../utils/getTokenHead");
const { appErr, AppErr } = require("../../utils/appErr");
const Post = require("../../model/Post/Post");
const Category = require("../../model/Category/Category");
const Comment = require("../../model/Comment/Comment");

//Register
const userRegisterCtrl = async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    //Check if email exist
    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(new AppErr("User Already Exists", 500));
    }

    // Hash password first
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Attempt to create user (this will trigger required field validation)
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user._doc;

    res.status(201).json({
      status: "Success",
      data: userWithoutPassword,
    });
  } catch (error) {
    // Check for duplicate email error
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(409).json({
        status: "Failed",
        message: "User Already Exists",
      });
    }

    next(error); // Pass Mongoose validation errors to global error handler
  }
};

//Login
const userLoginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    //Check if email exist
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return next(appErr("Invalid Login Credentials"));
    }
    //Verify Password
    const isPasswordMatched = await bcrypt.compare(
      password,
      userFound.password,
    );

    if (!isPasswordMatched) {
      if (!userFound) {
        return next(appErr("Invalid Login Credentials"));
      }
    }

    res.json({
      status: "Success",
      data: {
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: genToken(userFound._id),
      },
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Who Viewed my Profile
const whoViewedMyProfileCtrl = async (req, res, next) => {
  try {
    // 1. Find the original user
    const user = await User.findById(req.params.id);

    // 2. Find the logged-in user
    const userWhoViewed = await User.findById(req.userAuth);

    // 3. Check if both exist
    if (!user || !userWhoViewed) {
      return next(appErr("User not found", 404));
    }

    // 4. Check if already viewed
    const isUserAlreadyViewed = user.viewers.find(
      (viewer) => viewer.toString() === userWhoViewed._id.toString(),
    );

    if (isUserAlreadyViewed) {
      return next(appErr("You already viewed this profile", 400));
    }

    // 5. Add viewer
    user.viewers.push(userWhoViewed._id);

    // 6. Save
    await user.save();

    res.json({
      status: "Success",
      data: "You have successfully viewed this profile",
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Following
const followingCtrl = async (req, res, next) => {
  try {
    //1. Find The User To Follow
    const userToFollow = await User.findById(req.params.id);
    //2. Find The User Who is Following
    const userWhoFollowed = await User.findById(req.userAuth);
    //3. Check if User & userWhoFollowed Are Found
    if (userToFollow && userWhoFollowed) {
      //4. Check if userWhoFollowed is Already in the user's Follower's Array
      const isUserAlreadyFollowed = userToFollow.following.find(
        (follower) => follower.toString() === userWhoFollowed._id.toString(),
      );
      if (isUserAlreadyFollowed) {
        return next(appErr("You've Already Followed This User"));
      } else {
        //5. Push userWhoFollowed into the user's followers Array
        userToFollow.followers.push(userWhoFollowed._id);
        //Push userToFollow into the userWhoFollowed's following Array
        userWhoFollowed.following.push(userToFollow._id);

        //Save
        await userWhoFollowed.save();
        await userToFollow.save();
        res.json({
          status: "Success",
          data: "You've Successfully Followed This User",
        });
      }
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Unfollowing
const unFollowingCtrl = async (req, res, next) => {
  try {
    //1. Find the user to be unfollowed
    const userToBeUnFollowed = await User.findById(req.params.id);
    //2. Find the current user (who wants to unfollow)
    const currentUser = await User.findById(req.userAuth);

    //3. Check if both exist
    if (userToBeUnFollowed && currentUser) {
      //4. Check if current user is in the followers array
      const isUserAlreadyFollowing = userToBeUnFollowed.followers.find(
        (follower) => follower.toString() === currentUser._id.toString(),
      );

      if (!isUserAlreadyFollowing) {
        return next(appErr("You've Not Followed This User"));
      }

      //5. Remove current user from the target’s followers array
      userToBeUnFollowed.followers = userToBeUnFollowed.followers.filter(
        (follower) => follower.toString() !== currentUser._id.toString(),
      );
      await userToBeUnFollowed.save();

      //6. Remove target user from the current user’s following array
      currentUser.following = currentUser.following.filter(
        (following) =>
          following.toString() !== userToBeUnFollowed._id.toString(),
      );
      await currentUser.save();

      //7. Send response
      res.json({
        status: "Success",
        data: "You've Successfully Unfollowed This User",
      });
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//All
const userAllCtrl = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({
      status: "Success",
      data: users,
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Blocked
const blockedUserCtrl = async (req, res, next) => {
  try {
    // 1. Find the user to be blocked
    const userToBeBlocked = await User.findById(req.params.id);

    // 2. Find the current logged-in user
    const userWhoBlocked = await User.findById(req.userAuth);

    // 3. Check if both users exist
    if (!userWhoBlocked || !userToBeBlocked) {
      return next(appErr("User not found", 404));
    }

    // 4. Prevent user from blocking themselves
    if (userWhoBlocked._id.toString() === userToBeBlocked._id.toString()) {
      return next(appErr("You cannot block yourself", 400));
    }

    // 5. Check if the user is already blocked
    const isAlreadyBlocked = userWhoBlocked.blocked.some(
      (blocked) => blocked.toString() === userToBeBlocked._id.toString(),
    );

    if (isAlreadyBlocked) {
      return next(appErr("You have already blocked this user", 400));
    }

    // 6. Add target user to blocked list
    userWhoBlocked.blocked.push(userToBeBlocked._id);

    // 7. Save the updated user
    await userWhoBlocked.save();

    // 8. Send success response
    return res.status(200).json({
      status: "Success",
      data: "You've Successfully Blocked This User",
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Unblocked
const unblockedUserCtrl = async (req, res, next) => {
  try {
    // 1. Find the user to be unblocked
    const userToBeUnBlocked = await User.findById(req.params.id);

    // 2. Find the current logged-in user
    const userWhoUnBlocked = await User.findById(req.userAuth);

    // 3. Check if both users exist
    if (!userWhoUnBlocked || !userToBeUnBlocked) {
      return next(appErr("User not found", 404));
    }

    // 4. Prevent user from unblocking themselves
    if (userWhoUnBlocked._id.toString() === userToBeUnBlocked._id.toString()) {
      return next(appErr("You cannot unblock yourself", 400));
    }

    // 5. Check if the target user is actually blocked
    const isUserBlocked = userWhoUnBlocked.blocked.some(
      (blocked) => blocked.toString() === userToBeUnBlocked._id.toString(),
    );

    if (!isUserBlocked) {
      return next(appErr("You have not blocked this user", 400));
    }

    // 6. Remove the target user from the blocked list
    userWhoUnBlocked.blocked = userWhoUnBlocked.blocked.filter(
      (blocked) => blocked.toString() !== userToBeUnBlocked._id.toString(),
    );

    // 7. Save the updated user
    await userWhoUnBlocked.save();

    // 8. Send success response
    return res.status(200).json({
      status: "Success",
      data: "You've Successfully Unblocked This User",
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};
//Admin-Block
const adminBlockUserCtrl = async (req, res, next) => {
  try {
    //1. find user to be unblocked
    const userToBeBlocked = await User.findById(req.params.id);
    //2. check if user is found
    if (!userToBeBlocked) {
      return next(appErr("User Not Found"));
    }
    //3. change the isBlocked to true
    userToBeBlocked.isBlocked = true;
    //4. save
    await userToBeBlocked.save();
    res.json({
      status: "Success",
      data: "You've Successfully Block This User",
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Admin-Unblock
const adminUnblockUserCtrl = async (req, res, next) => {
  try {
    //1. find user to be unblocked
    const userToBeUnblocked = await User.findById(req.params.id);
    //2. check if user is found
    if (!userToBeUnblocked) {
      return next(appErr("User Not Found"));
    }
    //3. change the isBlocked to true
    userToBeUnblocked.isBlocked = false;
    //4. save
    await userToBeUnblocked.save();
    res.json({
      status: "Success",
      data: "You've Successfully Unblocked This User",
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Profile
const userProfileCtrl = async (req, res) => {
  try {
    //Get token from header
    const user = await User.findById(req.userAuth);
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Update
const userUpdateCtrl = async (req, res, next) => {
  const { email, lastname, firstname } = req.body;
  try {
    //Check if email is not taken
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return next(appErr("Email Already Used", 400));
      }
    }

    //Update the user
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      {
        lastname,
        firstname,
        email,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    //Send Response
    res.json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Update Password
const updatePasswordCtrl = async (req, res, next) => {
  const { password } = req.body;

  try {
    // Check if password was provided
    if (!password) {
      return next(appErr("Please provide password field", 400));
    }

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    const user = await User.findByIdAndUpdate(
      req.userAuth,
      {
        password: hashedPassword,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    // Check if user exists
    if (!user) {
      return next(appErr("User not found", 404));
    }

    res.json({
      status: "Success",
      data: "Password Has Been Changed Successfully",
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Delete Account
const deleteUserAcountCtrl = async (req, res, next) => {
  try {
    //1. Find the user to be deleted
    const userToBeDeleted = await User.findById(req.userAuth);
    //2. Find all post be deleted
    await Post.deleteMany({ user: req.userAuth });
    //3. Delete all comment of the user
    await Comment.deleteMany({ user: req.userAuth });
    //4. Delete all category of the user
    await Category.deleteMany({ user: req.userAuth });

    //5. Delete User
    await userToBeDeleted.deleteOne();
    //send response
    return res.json({
      status: "Success",
      data: "Your Account Has Been Sucessfully Deleted",
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

//Profile Photo Upload
const profilePhotoUploadCtrl = async (req, res, next) => {
  console.log(req.file);
  try {
    //1. Find the user to be updated
    const userToUpdate = await User.findById(req.userAuth);
    //2. Check if user is found
    if (!userToUpdate) {
      return next(appErr("User not found", 404));
    }
    //3. Check if user is blocked
    if (userToUpdate.isBlocked) {
      return next(appErr("Action Not Allowed: Your Account is Blocked", 403));
    }
    //4. Check if user is updating photo
    if (req.file) {
      //5. Updating profile photo
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: true,
        },
      );
      res.json({
        status: "Success",
        data: "You have Successfully Updated Your Profile Photo",
      });
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};
module.exports = {
  userRegisterCtrl,
  userLoginCtrl,
  userAllCtrl,
  userProfileCtrl,
  userUpdateCtrl,
  profilePhotoUploadCtrl,
  whoViewedMyProfileCtrl,
  followingCtrl,
  unFollowingCtrl,
  blockedUserCtrl,
  unblockedUserCtrl,
  adminBlockUserCtrl,
  adminUnblockUserCtrl,
  updatePasswordCtrl,
  deleteUserAcountCtrl,
};
