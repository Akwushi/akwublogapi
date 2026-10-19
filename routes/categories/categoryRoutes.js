const express = require("express");
const { categoryCreatedCtrl, 
    categorySingleCtrl, 
    categoryAllCtrl, 
    categoryDeleteCtrl, 
    categoryUpdateCtrl, fetchAllCategoriesCtrl } = require("../../controllers/categories/categoryCtrl");
const isLogin = require("../../middlewares/isLogin");

const categoryRouter = express.Router();

//POST/api/v1/posts
categoryRouter.post("/", isLogin, categoryCreatedCtrl);

//GET/api/v1/categorys/:id
categoryRouter.get("/:id", categorySingleCtrl);

//GET/api/v1/category/:id
categoryRouter.put("/:id", categoryUpdateCtrl);

//GET/api/v1/categories
categoryRouter.get("/", fetchAllCategoriesCtrl);

//DELETE/api/v1/category/:id
categoryRouter.delete("/:id", isLogin, categoryDeleteCtrl);

//PUT/api/v1/category/:id
categoryRouter.put("/:id", isLogin, categoryUpdateCtrl);

module.exports = categoryRouter