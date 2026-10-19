const globalErrHandler = (err, req, res, next) => {
  const stack = err.stack;
  const message = err.message;
  const status = err.status? err.status:"Failed";
  const statusCode = err.statusCode? err.statusCode:"500";

  res.status(500).json({
    message,
    stack,
    status,
  });
};

module.exports = globalErrHandler;