const jwt = require("jsonwebtoken");
const genToken = id=>{
    return jwt.sign({id}, process.env.JWT_KEY, {expiresIn: "7d"});
};


module.exports = genToken; 