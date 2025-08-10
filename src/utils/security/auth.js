// Authentication and security utilities
import CryptoJS from 'crypto-js';

// JWT token management
export const TokenManager = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken || TokenManager.isTokenExpired(refreshToken)) {
      TokenManager.clearTokens();
      window.location.href = '/login';
      return null;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { accessToken, refreshToken: newRefreshToken } = await response.json();
        TokenManager.setTokens(accessToken, newRefreshToken);
        return accessToken;
      } else {
        TokenManager.clearTokens();
        window.location.href = '/login';
        return null;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      TokenManager.clearTokens();
      window.location.href = '/login';
      return null;
    }
  }
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// XSS protection
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// CSRF token management
export const CSRFManager = {
  getToken: () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  },

  setToken: (token) => {
    let meta = document.querySelector('meta[name="csrf-token"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'csrf-token';
      document.head.appendChild(meta);
    }
    meta.content = token;
  }
};

// Secure API request wrapper
export const secureApiRequest = async (url, options = {}) => {
  let accessToken = TokenManager.getAccessToken();
  
  // Check if token is expired and refresh if needed
  if (TokenManager.isTokenExpired(accessToken)) {
    accessToken = await TokenManager.refreshAccessToken();
    if (!accessToken) return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'X-CSRF-Token': CSRFManager.getToken(),
    ...options.headers
  };

  // Sanitize request body if it exists
  let body = options.body;
  if (body && typeof body === 'string') {
    try {
      const parsedBody = JSON.parse(body);
      const sanitizedBody = sanitizeObject(parsedBody);
      body = JSON.stringify(sanitizedBody);
    } catch (error) {
      // If not JSON, sanitize as string
      body = sanitizeInput(body);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      const newToken = await TokenManager.refreshAccessToken();
      if (newToken) {
        // Retry request with new token
        headers.Authorization = `Bearer ${newToken}`;
        return fetch(url, { ...options, headers, body });
      }
    }

    return response;
  } catch (error) {
    console.error('Secure API request failed:', error);
    throw error;
  }
};

// Sanitize object recursively
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeInput(key)] = sanitizeObject(value);
  }
  return sanitized;
};

// Password strength validator
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;

  return {
    score,
    isValid: score >= 4,
    feedback: {
      length: password.length >= minLength,
      upperCase: hasUpperCase,
      lowerCase: hasLowerCase,
      numbers: hasNumbers,
      specialChar: hasSpecialChar
    }
  };
};

// Two-factor authentication utilities
export const TwoFactorAuth = {
  generateQRCode: async (secret, email) => {
    const issuer = 'TenderMatch Pro';
    const otpauth = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;
    
    // In a real app, you would use a QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  },

  verifyTOTP: async (token, secret) => {
    try {
      const response = await secureApiRequest('/api/auth/verify-totp', {
        method: 'POST',
        body: JSON.stringify({ token, secret })
      });
      
      return response.ok;
    } catch (error) {
      console.error('TOTP verification failed:', error);
      return false;
    }
  }
};

// Rate limiting for client-side
export const RateLimiter = {
  attempts: new Map(),

  isAllowed: (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const now = Date.now();
    const attempts = RateLimiter.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    RateLimiter.attempts.set(key, validAttempts);
    return true;
  },

  reset: (key) => {
    RateLimiter.attempts.delete(key);
  }
};

// Secure local storage with encryption
export const SecureStorage = {
  encrypt: (data, key = 'tendermatch-secret') => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  },

  decrypt: (encryptedData, key = 'tendermatch-secret') => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  },

  setItem: (key, data) => {
    const encrypted = SecureStorage.encrypt(data);
    localStorage.setItem(key, encrypted);
  },

  getItem: (key) => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return SecureStorage.decrypt(encrypted);
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
  }
};