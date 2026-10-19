const { title } = require("process");
const Category = require("../../model/Category/Category");
const { appErr } = require("../../utils/appErr");
appErr

//Created
const categoryCreatedCtrl = async (req, res, next) => {
  const {title} = req.body;
  try {
    const category = await Category.create({title, user: req.userAuth}); 
    res.json({
      status: "Success",
      data: category,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Fetch All Categories
const fetchAllCategoriesCtrl = async (req, res) => {
  try {
    const categories = await Category.find(); 
    res.json({
      status: "Success",
      data: categories,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Single
const categorySingleCtrl = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id); 
    res.json({
      status: "Success",
      data: category,
    });
  } catch (error) { 
    next(appErr(error.message));
  }
};

//All
const categoryAllCtrl = async (req, res) => {
  try {
    res.json({
      status: "Success",
      data: "Categorys Route",
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//Delete
const categoryDeleteCtrl = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({
      status: "Success",
      data: "Category Successfully Deleted",
    });
  } catch (error) {
    next(appErr(error.message));;
  }
};

//Update
const categoryUpdateCtrl = async (req, res) => {
  const {title} = req.body;
  try {
     const category = await Category.findByIdAndUpdate(req.params.id,
      {title},
      {new: true, runValidators: true} 
    );
    res.json({
      status: "Success",
      data: category,
    });
  } catch (error) {
   next(appErr(error.message));
  }
};

module.exports = {
  categoryCreatedCtrl,
  categorySingleCtrl,
  categoryAllCtrl,
  categoryDeleteCtrl,
  categoryUpdateCtrl,
  fetchAllCategoriesCtrl,
};
