// Optional fallthrough error handler
export const errorHandler = (err, req, res, next) => {
  res.statusCode = 500;
  res.end(`Server Error: ${res.sentry}\n`);
}; 