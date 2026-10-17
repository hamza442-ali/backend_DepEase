function rateLimit({ windowMs = 15 * 60 * 1000, limit = 20, now = Date.now } = {}) {
  const attempts = new Map();
  return (req, res, next) => {
    const time = now();
    for (const [key, attempt] of attempts) {
      if (attempt.expires <= time) attempts.delete(key);
    }
    const key = req.ip;
    const attempt = attempts.get(key) || { count: 0, expires: time + windowMs };
    attempts.set(key, attempt);
    if (++attempt.count > limit) {
      res.set('Retry-After', String(Math.ceil((attempt.expires - time) / 1000)));
      return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    }
    return next();
  };
}

module.exports = { rateLimit };
