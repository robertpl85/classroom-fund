const sanitizeHtml = require('sanitize-html');

function sanitizeInput(obj) {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, { allowedTags: [], allowedAttributes: {} });
  }
  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      obj[key] = sanitizeInput(obj[key]);
    });
  }
  return obj;
}

function sanitizeMiddleware(req, res, next) {
  if (req.body) req.body = sanitizeInput(req.body);
  next();
}

module.exports = sanitizeMiddleware;
