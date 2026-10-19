const express = require("express");
const { postCreatedCtrl, 
    postSingleCtrl, 
    postDeleteCtrl, 
    postUpdateCtrl,
    fetchPostCtrl,
    toggleLikesPostCtrl,
    toggleDislikesPostCtrl  
} = require("../../controllers/posts/postCtrl");
const isLogin = require("../../middlewares/isLogin");
const upload = require("../../middlewares/upload");



const postRouter = express.Router();

//POST/api/v1/posts
postRouter.post("/", isLogin, postCreatedCtrl);

//GET/api/v1/posts/:id
postRouter.get("/likes/:id", isLogin, toggleLikesPostCtrl);

//GET/api/v1/posts/:id
postRouter.get("/dislikes/:id", isLogin, toggleDislikesPostCtrl);

//GET/api/v1/posts/:id
postRouter.get("/:id", isLogin, postSingleCtrl);

//GET/api/v1/Posts
postRouter.get("/", isLogin, fetchPostCtrl );

//DELETE/api/v1/posts/:id
postRouter.delete("/:id",isLogin, postDeleteCtrl);

//PUT/api/v1/posts/:id
postRouter.put("/:id", isLogin, upload.single("image"), postUpdateCtrl);

module.exports = postRouter