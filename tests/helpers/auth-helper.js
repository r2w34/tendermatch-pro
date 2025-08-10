// Authentication helper utilities for testing
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

class AuthHelper {
  constructor() {
    this.testUsers = new Map();
    this.testTokens = new Map();
    this.jwtSecret = process.env.TEST_JWT_SECRET || 'test_jwt_secret_key';
  }

  // Generate test user data
  generateTestUser(overrides = {}) {
    const user = {
      id: faker.number.int({ min: 1, max: 10000 }),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      company: faker.company.name(),
      phone: '+91-' + faker.string.numeric(10),
      password: 'TestPassword123!',
      verified: true,
      subscription_plan: 'basic',
      role: 'user',
      created_at: faker.date.past(),
      ...overrides
    };

    return user;
  }

  // Create test user with hashed password
  async createTestUser(userData = {}) {
    const user = this.generateTestUser(userData);
    
    // Hash password for database storage
    const saltRounds = parseInt(process.env.TEST_BCRYPT_ROUNDS) || 1;
    user.password_hash = await bcrypt.hash(user.password, saltRounds);
    
    // Store in memory for testing
    this.testUsers.set(user.email, user);
    
    return user;
  }

  // Generate JWT token for testing
  generateTestToken(user, expiresIn = '1h') {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      subscription: user.subscription_plan || 'free',
      verified: user.verified || false
    };

    const token = jwt.sign(payload, this.jwtSecret, { expiresIn });
    this.testTokens.set(token, user);
    
    return token;
  }

  // Generate refresh token
  generateRefreshToken(user, expiresIn = '7d') {
    const payload = {
      id: user.id,
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn });
  }

  // Verify test token
  verifyTestToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Generate expired token for testing
  generateExpiredToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    };

    // Token expired 1 hour ago
    const expiredTime = Math.floor(Date.now() / 1000) - 3600;
    payload.exp = expiredTime;

    return jwt.sign(payload, this.jwtSecret);
  }

  // Generate invalid token for testing
  generateInvalidToken() {
    return jwt.sign({ invalid: true }, 'wrong_secret');
  }

  // Mock authentication middleware
  mockAuthMiddleware(user = null) {
    return (req, res, next) => {
      if (user) {
        req.user = user;
        req.authenticated = true;
      } else {
        req.authenticated = false;
      }
      next();
    };
  }

  // Mock authorization middleware
  mockAuthzMiddleware(requiredRole = 'user') {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (req.user.role !== requiredRole && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      next();
    };
  }

  // Create admin user for testing
  async createAdminUser(overrides = {}) {
    const adminData = {
      email: 'admin@tendermatch.pro',
      name: 'Test Admin',
      role: 'admin',
      subscription_plan: 'enterprise',
      ...overrides
    };

    return await this.createTestUser(adminData);
  }

  // Create premium user for testing
  async createPremiumUser(overrides = {}) {
    const premiumData = {
      subscription_plan: 'pro',
      verified: true,
      ...overrides
    };

    return await this.createTestUser(premiumData);
  }

  // Simulate login process
  async simulateLogin(email, password) {
    const user = this.testUsers.get(email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return { success: false, error: 'Invalid password' };
    }

    const accessToken = this.generateTestToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        verified: user.verified,
        subscription_plan: user.subscription_plan
      },
      tokens: {
        accessToken,
        refreshToken
      }
    };
  }

  // Mock OAuth user data
  generateOAuthUser(provider = 'google', overrides = {}) {
    const baseUser = this.generateTestUser(overrides);
    
    return {
      ...baseUser,
      oauth_provider: provider,
      oauth_id: faker.string.uuid(),
      verified: true, // OAuth users are typically pre-verified
      avatar_url: faker.image.avatar()
    };
  }

  // Generate API key for testing
  generateApiKey(user) {
    const keyData = {
      user_id: user.id,
      key_id: faker.string.uuid(),
      created_at: new Date().toISOString()
    };

    // Simple API key format: base64 encoded JSON
    return Buffer.from(JSON.stringify(keyData)).toString('base64');
  }

  // Validate API key
  validateApiKey(apiKey) {
    try {
      const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString());
      const user = Array.from(this.testUsers.values()).find(u => u.id === decoded.user_id);
      
      return { valid: true, user, keyData: decoded };
    } catch (error) {
      return { valid: false, error: 'Invalid API key' };
    }
  }

  // Mock session data
  generateSessionData(user) {
    return {
      sessionId: faker.string.uuid(),
      userId: user.id,
      email: user.email,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent()
    };
  }

  // Mock 2FA setup
  generate2FASecret(user) {
    return {
      secret: faker.string.alphanumeric(32),
      qrCode: `otpauth://totp/TenderMatch:${user.email}?secret=${faker.string.alphanumeric(32)}&issuer=TenderMatch`,
      backupCodes: Array.from({ length: 10 }, () => faker.string.alphanumeric(8))
    };
  }

  // Verify 2FA token (mock)
  verify2FAToken(secret, token) {
    // In real implementation, this would use TOTP library
    // For testing, we'll accept specific test tokens
    const validTestTokens = ['123456', '000000', '111111'];
    return validTestTokens.includes(token);
  }

  // Mock password reset token
  generatePasswordResetToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      type: 'password_reset',
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };

    return jwt.sign(payload, this.jwtSecret);
  }

  // Mock email verification token
  generateEmailVerificationToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      type: 'email_verification',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    return jwt.sign(payload, this.jwtSecret);
  }

  // Create test authorization headers
  createAuthHeaders(user) {
    const token = this.generateTestToken(user);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Create API key headers
  createApiKeyHeaders(user) {
    const apiKey = this.generateApiKey(user);
    return {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    };
  }

  // Mock rate limiting data
  generateRateLimitData(user, endpoint) {
    return {
      userId: user.id,
      endpoint,
      requests: faker.number.int({ min: 1, max: 100 }),
      windowStart: Date.now() - (15 * 60 * 1000), // 15 minutes ago
      limit: 100,
      remaining: faker.number.int({ min: 0, max: 99 }),
      resetTime: Date.now() + (15 * 60 * 1000) // 15 minutes from now
    };
  }

  // Clean up test data
  cleanup() {
    this.testUsers.clear();
    this.testTokens.clear();
    console.log('✅ Auth helper cleanup complete');
  }

  // Get all test users
  getAllTestUsers() {
    return Array.from(this.testUsers.values());
  }

  // Get user by email
  getTestUser(email) {
    return this.testUsers.get(email);
  }

  // Update test user
  updateTestUser(email, updates) {
    const user = this.testUsers.get(email);
    if (user) {
      Object.assign(user, updates);
      this.testUsers.set(email, user);
    }
    return user;
  }

  // Delete test user
  deleteTestUser(email) {
    return this.testUsers.delete(email);
  }
}

// Singleton instance
const authHelper = new AuthHelper();

export default authHelper;

// Convenience functions
export const createTestUser = async (userData = {}) => {
  return await authHelper.createTestUser(userData);
};

export const generateTestToken = (user, expiresIn = '1h') => {
  return authHelper.generateTestToken(user, expiresIn);
};

export const createAuthHeaders = (user) => {
  return authHelper.createAuthHeaders(user);
};

export const simulateLogin = async (email, password) => {
  return await authHelper.simulateLogin(email, password);
};

export const cleanupAuth = () => {
  authHelper.cleanup();
};