/**
 * Input Sanitization & XSS Defense Middleware
 * Requirement: SRS SEC-04; Test Plan TC-08
 * Issue: #17 [SP-3] SEC-02: Input Sanitization, Parameterized Queries & XSS/SQLi Defense
 * Author: Monika PM (@Monikapm19)
 */

/**
 * Sanitize a string by stripping dangerous script/HTML tags and event handlers
 * @param {string} value
 * @returns {string}
 */
const sanitizeValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  // 1. Remove script tags and contents: <script>...</script>
  let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove dangerous elements: <iframe>, <object>, <embed>, <applet>, <meta>, <link>, <style>
  sanitized = sanitized.replace(/<\/?(?:iframe|object|embed|applet|meta|link|style)\b[^>]*>/gi, '');

  // 3. Remove inline javascript/data protocols: javascript:..., vbscript:..., data:text/html...
  sanitized = sanitized.replace(/(javascript|vbscript|data):/gi, '$1_blocked:');

  // 4. Remove inline event handlers (onerror=, onload=, onclick=, onmouseover=, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '');

  // 5. Strip or encode residual opening/closing tags for remaining tags
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return sanitized.trim();
};

/**
 * Recursively sanitize objects, arrays, and primitive strings
 * @param {any} input
 * @returns {any}
 */
const deepSanitize = (input) => {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeValue(input);
  }

  if (Array.isArray(input)) {
    return input.map((item) => deepSanitize(item));
  }

  if (typeof input === 'object') {
    const sanitizedObj = {};
    for (const [key, val] of Object.entries(input)) {
      sanitizedObj[key] = deepSanitize(val);
    }
    return sanitizedObj;
  }

  return input;
};

/**
 * Express Middleware: Sanitize req.body, req.query, and req.params
 */
const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = deepSanitize(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = deepSanitize(req.params);
  }

  next();
};

module.exports = {
  sanitizeInput,
  sanitizeValue,
  deepSanitize,
};
