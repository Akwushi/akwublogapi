const appErr = (message, statusCode) => {
  let error = new Error(message);
  error.statusCode = statusCode ? statusCode : 500;
  error.stack = error.stack;
  return error;
};

//Err Class
class AppErr extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = "Failed";
  }
}
module.exports = { appErr, AppErr };
