const { appErr } = require("../utils/appErr");
const getTokenHead = require("../utils/getTokenHead");
const verifyToken = require("../utils/verifyToken");
const User = require("../model/User/User");

const isAdmin = async (req, res, next) => {
  //Get Token From Header
  const token = getTokenHead(req);

  //Verify The Token
  const decodedUser = verifyToken(token);
  //Save User Req Object
  req.userAuth = decodedUser.id;

  //find the user in DB

  const user = await User.findById(decodedUser.id);

  //Check if admin
  if (user.isAdmin) {
    return next();
  } else {
    return next(appErr("Access Denied, Admin Only", 403));
  }
};

module.exports = isAdmin;
