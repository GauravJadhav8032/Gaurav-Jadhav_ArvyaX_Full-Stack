/**
 * Global error handling middleware.
 * Returns a consistent JSON error response for all unhandled errors.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  if (err.stack) console.error(err.stack);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
