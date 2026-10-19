const express = require("express");
const { commentCreatedCtrl, 
    commentDeleteCtrl, 
    commentUpdateCtrl } = require("../../controllers/comments/commentCtrl");
const isLogin = require("../../middlewares/isLogin");


const commentRouter = express.Router();

//POST/api/v1/posts
commentRouter.post("/:id", isLogin, commentCreatedCtrl);

//DELETE/api/v1/comments/:id
commentRouter.delete("/:id",isLogin, commentDeleteCtrl);

//PUT/api/v1/comments/:id
commentRouter.put("/:id", isLogin, commentUpdateCtrl);

module.exports = commentRouter