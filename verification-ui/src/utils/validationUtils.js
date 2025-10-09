/**
 * Validation utilities for security-critical operations
 */

/**
 * Validates Nillion API key format
 * @param {string} key - The API key to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateApiKeyFormat = (key) => {
  // Check if key exists
  if (!key || typeof key !== 'string') {
    return {
      valid: false,
      error: 'API key must be a non-empty string'
    };
  }

  // Remove whitespace
  const trimmedKey = key.trim();

  // Check minimum length (Nillion keys are 64 characters)
  if (trimmedKey.length !== 64) {
    return {
      valid: false,
      error: 'API key must be exactly 64 characters'
    };
  }

  // Check if it's a valid hexadecimal string
  const hexPattern = /^[a-f0-9]{64}$/i;
  if (!hexPattern.test(trimmedKey)) {
    return {
      valid: false,
      error: 'API key must contain only hexadecimal characters (0-9, a-f)'
    };
  }

  // Check for obviously fake/test keys
  const testPatterns = [
    /^0+$/,           // All zeros
    /^1+$/,           // All ones
    /^(abc123)+/i,    // Repeated test patterns
    /^(test)+/i,      // Contains "test"
    /^(demo)+/i,      // Contains "demo"
  ];

  for (const pattern of testPatterns) {
    if (pattern.test(trimmedKey)) {
      return {
        valid: false,
        error: 'API key appears to be a test/placeholder value'
      };
    }
  }

  return {
    valid: true
  };
};

/**
 * Rate limiter class for API calls
 */
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if a request can be made
   * @returns {Object} - { allowed: boolean, retryAfter?: number }
   */
  canMakeRequest() {
    const now = Date.now();

    // Remove requests outside the current window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      // Calculate when the oldest request will expire
      const oldestRequest = Math.min(...this.requests);
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);

      return {
        allowed: false,
        retryAfter: retryAfter
      };
    }

    // Record this request
    this.requests.push(now);

    return {
      allowed: true
    };
  }

  /**
   * Get current rate limit status
   * @returns {Object} - { remaining: number, total: number, resetAt: Date }
   */
  getStatus() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    const remaining = Math.max(0, this.maxRequests - this.requests.length);
    const resetAt = this.requests.length > 0
      ? new Date(Math.min(...this.requests) + this.windowMs)
      : new Date(now + this.windowMs);

    return {
      remaining,
      total: this.maxRequests,
      resetAt
    };
  }

  /**
   * Reset the rate limiter
   */
  reset() {
    this.requests = [];
  }
}

/**
 * Sanitizes data for logging (removes sensitive fields)
 * @param {Object} data - Data to sanitize
 * @returns {Object} - Sanitized data
 */
export const sanitizeForLogging = (data) => {
  const sensitiveFields = ['apiKey', 'token', 'password', 'secret', 'authorization'];

  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => sanitize(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Check if this is a sensitive field
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));

      if (isSensitive) {
        if (typeof value === 'string' && value.length > 16) {
          // Mask the middle part, show first/last 8 chars
          sanitized[key] = `${value.slice(0, 8)}...${value.slice(-8)}`;
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  };

  return sanitize(data);
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      error: 'URL must be a non-empty string'
    };
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return {
        valid: false,
        error: 'URL must use http:// or https:// protocol'
      };
    }

    return {
      valid: true
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format'
    };
  }
};

export default {
  validateApiKeyFormat,
  RateLimiter,
  sanitizeForLogging,
  validateUrl
};
