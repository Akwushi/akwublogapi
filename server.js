const express = require("express");
const userRouter = require("./routes/users/userRoutes");
const postRouter = require("./routes/posts/postRoutes");
const commentRouter = require("./routes/comments/commentRoutes");
const categoryRouter = require("./routes/categories/categoryRoutes");
const globalErrHandler = require("./middlewares/globalErrHandler");

require("dotenv").config();
require("./config/dbConnect");

const app = express();

// Middlewares
app.use(express.json()) //pass incoming payload


//----------
//Routes
//----------


//Users Route
app.use("/api/v1/users", userRouter);

//Posts route
app.use("/api/v1/posts", postRouter);

//Comments route
app.use("/api/v1/comments", commentRouter);

//Categories route 
app.use("/api/v1/categories", categoryRouter);

// Error handlers middleware
app.use(globalErrHandler);

app.use((req, res) => {
  console.log(req.originalUrl);
  res.status(404).json({
    message: `${req.originalUrl} - Route Not Found`,
  });
});


const PORT = process.env.PORT || 9000;

// Start the server
app.listen(PORT, console.log(`Server is up and running on port ${PORT}`));
