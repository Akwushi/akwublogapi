const mongoose = require("mongoose");

//create Schema
const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

//Compile the Category model
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
