class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = handler => (req, res, next) => {
  return Promise.resolve().then(() => handler(req, res, next)).catch(next);
};

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = error.status || 500;
  let message = error.message;
  if (error.name === 'ValidationError' || error.name === 'CastError' || error instanceof SyntaxError) {
    status = 400;
    message = 'Invalid request data';
  } else if (error.code === 11000) {
    status = 409;
    message = 'A record with these unique fields already exists';
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'File exceeds the upload limit';
  } else if (error.name === 'MulterError') {
    status = 400;
    message = 'Invalid file upload';
  } else if (error.isAxiosError) {
    status = 502;
    message = 'External service request failed';
  }
  if (status >= 500) {
    message = status === 502 ? 'External service request failed'
      : status === 503 ? 'Service integration is not configured or available' : 'Internal server error';
  }
  return res.status(status).json({ error: message });
}

function validateInput(req, res, next) {
  const stack = [req.body, req.query];
  while (stack.length) {
    const value = stack.pop();
    if (!value || typeof value !== 'object') continue;
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.') || ['__proto__', 'constructor', 'prototype'].includes(key)) {
        return next(new HttpError(400, 'Invalid field name'));
      }
      if (child && typeof child === 'object') stack.push(child);
    }
  }
  return next();
}

module.exports = { HttpError, asyncHandler, errorHandler, validateInput };
