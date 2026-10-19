const { appErr } = require("../utils/appErr");
const getTokenHead = require("../utils/getTokenHead");
const verifyToken = require("../utils/verifyToken");

const isLogin = (req, res, next) => {
  //Get Token From Header
  const token = getTokenHead(req);

  //Verify The Token
  const decodedUser = verifyToken(token);
  //Save User Req Object
  req.userAuth = decodedUser.id;

  if (!decodedUser) {
    return next(appErr("Invalid/Expired Token. Please , login Again.", 500));
  } else {
    next();
  }
};

module.exports = isLogin;
