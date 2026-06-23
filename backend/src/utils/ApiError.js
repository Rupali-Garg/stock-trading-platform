// Custom error class for our application
// Instead of throwing generic errors, we throw ApiErrors
// which carry a statusCode so the error handler knows
// what HTTP status to send back

class ApiError extends Error {
  constructor(statusCode, message) {
    // Call the parent Error class constructor
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = true;
    // isOperational = true means this is an expected error
    // (wrong password, user not found, etc.)
    // isOperational = false would mean a programmer mistake

    // Captures where the error was thrown in the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;