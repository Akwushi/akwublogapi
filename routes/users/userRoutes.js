const express = require("express");
const {
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
  deleteUserAcountCtrl
} = require("../../controllers/users/userCtrl");
const isLogin = require("../../middlewares/isLogin");
const storage = require("../../config/cloudinary");
const multer = require("multer");
const isAdmin = require("../../middlewares/isAdmin");

const userRouter = express.Router();


//Instance of multer
const upload = multer({ storage });

//POST/api/v1/users/register
userRouter.post("/register", userRegisterCtrl);

//POST/api/v1/users/login
userRouter.post("/login", userLoginCtrl);

//GET/api/v1/users
userRouter.get("/", userAllCtrl);

//GET/api/v1/users/:id
userRouter.get("/profile/", isLogin, userProfileCtrl);

//PUT/api/v1/users/:id
userRouter.put("/", isLogin, userUpdateCtrl);

//GET/api/v1/users/profile-viewers/:id
userRouter.get("/profile-viewers/:id", isLogin, whoViewedMyProfileCtrl);

//GET/api/v1/users/following/:id
userRouter.get("/following/:id", isLogin, followingCtrl);

//GET/api/v1/users/Unfollowing/:id
userRouter.get("/unfollowing/:id", isLogin, unFollowingCtrl);

//GET/api/v1/users/Blocked/:id
userRouter.get("/blocked/:id", isLogin, blockedUserCtrl);

//GET/api/v1/users/unBlocked/:id
userRouter.get("/unblocked/:id", isLogin, unblockedUserCtrl);

//PUT/api/v1/users/Blocked/:id
userRouter.put("/admin-block/:id", isLogin, isAdmin, adminBlockUserCtrl);

//PUT/api/v1/users/unBlocked/:id
userRouter.put("/admin-unblock/:id", isLogin, isAdmin, adminUnblockUserCtrl);


//PUT/api/v1/users/UpdatePassword
userRouter.put("/update-password", isLogin, updatePasswordCtrl);


//PUT/api/v1/users/Delete Account
userRouter.delete("/delete-account", isLogin, deleteUserAcountCtrl);




//POST/api/v1/users/:id
userRouter.post(
  "/profile-photo-upload",
  isLogin,
  upload.single("profile"),
  profilePhotoUploadCtrl,
);

module.exports = userRouter;

