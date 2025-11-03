// Global error handling middleware
export function errorHandler(err, req, res, next) {
  console.error("[ERROR]", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  const status = err.status || 500
  const message = err.message || "Internal server error"

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    path: req.path,
  })
}

// Async error wrapper
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Custom error class
export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}
