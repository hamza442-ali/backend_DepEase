const { HttpError } = require('../errors/http-error');

const FORBIDDEN_FIELDS = new Set(['__proto__', 'constructor', 'prototype']);

function validateInput(req, res, next) {
  const pending = [req.body, req.query];

  while (pending.length) {
    const value = pending.pop();
    if (!value || typeof value !== 'object') continue;

    for (const [field, child] of Object.entries(value)) {
      if (field.startsWith('$') || field.includes('.') || FORBIDDEN_FIELDS.has(field)) {
        return next(new HttpError(400, 'Invalid field name'));
      }
      if (child && typeof child === 'object') pending.push(child);
    }
  }

  return next();
}

module.exports = { validateInput };
