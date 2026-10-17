const ERROR_RESPONSES = {
  invalidRequest: { status: 400, message: 'Invalid request data' },
  duplicateRecord: { status: 409, message: 'A record with these unique fields already exists' },
  fileTooLarge: { status: 413, message: 'File exceeds the upload limit' },
  invalidUpload: { status: 400, message: 'Invalid file upload' },
  externalService: { status: 502, message: 'External service request failed' },
};

function describeError(error) {
  if (['ValidationError', 'CastError'].includes(error.name) || error instanceof SyntaxError) {
    return ERROR_RESPONSES.invalidRequest;
  }
  if (error.code === 11000) return ERROR_RESPONSES.duplicateRecord;
  if (error.code === 'LIMIT_FILE_SIZE') return ERROR_RESPONSES.fileTooLarge;
  if (error.name === 'MulterError') return ERROR_RESPONSES.invalidUpload;
  if (error.isAxiosError) return ERROR_RESPONSES.externalService;

  const status = error.status || 500;
  if (status < 500) return { status, message: error.message };
  const message =
    status === 502
      ? 'External service request failed'
      : status === 503
        ? 'Service integration is not configured or available'
        : 'Internal server error';
  return { status, message };
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const { status, message } = describeError(error);
  return res.status(status).json({ error: message });
}

module.exports = { errorHandler };
