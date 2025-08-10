const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.company_name = data.company_name;
    this.gstin = data.gstin;
    this.phone = data.phone;
    this.preferences = data.preferences;
    this.is_admin = data.is_admin;
    this.is_verified = data.is_verified;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Don't include password in the object
  }

  // Create a new user
  static async create(userData) {
    const { email, password, company_name, gstin, phone, preferences } = userData;
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (email, password, company_name, gstin, phone, preferences)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, company_name, gstin, phone, preferences, is_admin, is_verified, created_at, updated_at
    `;

    const values = [
      email.toLowerCase(),
      hashedPassword,
      company_name,
      gstin,
      phone,
      JSON.stringify(preferences || {})
    ];

    try {
      const result = await pool.query(query, values);
      return new User(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await pool.query(query, [email.toLowerCase()]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = `
      SELECT id, email, company_name, gstin, phone, preferences, is_admin, is_verified, created_at, updated_at 
      FROM users WHERE id = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Authenticate user
  static async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return new User(userWithoutPassword);
    } catch (error) {
      throw error;
    }
  }

  // Generate JWT token
  generateToken() {
    const payload = {
      id: this.id,
      email: this.email,
      is_admin: this.is_admin
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  }

  // Generate refresh token
  generateRefreshToken() {
    const payload = {
      id: this.id,
      type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Update user
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    // Handle password hashing if password is being updated
    if (updateData.password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        
        if (key === 'preferences') {
          values.push(JSON.stringify(updateData[key]));
        } else if (key === 'email') {
          values.push(updateData[key].toLowerCase());
        } else {
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, company_name, gstin, phone, preferences, is_admin, is_verified, created_at, updated_at
    `;
    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get user's favorite tenders
  async getFavorites(pagination = {}) {
    const limit = pagination.limit || 20;
    const offset = ((pagination.page || 1) - 1) * limit;

    const query = `
      SELECT t.*, f.created_at as favorited_at
      FROM tenders t
      INNER JOIN favorites f ON t.id = f.tender_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await pool.query(query, [this.id, limit, offset]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Add tender to favorites
  async addToFavorites(tenderId) {
    const query = `
      INSERT INTO favorites (user_id, tender_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, tender_id) DO NOTHING
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [this.id, tenderId]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Remove tender from favorites
  async removeFromFavorites(tenderId) {
    const query = 'DELETE FROM favorites WHERE user_id = $1 AND tender_id = $2 RETURNING *';

    try {
      const result = await pool.query(query, [this.id, tenderId]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Check if tender is in favorites
  async isFavorite(tenderId) {
    const query = 'SELECT id FROM favorites WHERE user_id = $1 AND tender_id = $2';

    try {
      const result = await pool.query(query, [this.id, tenderId]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  async getStats() {
    const queries = [
      'SELECT COUNT(*) as favorite_count FROM favorites WHERE user_id = $1',
      'SELECT COUNT(*) as saved_searches FROM saved_searches WHERE user_id = $1',
      'SELECT created_at FROM users WHERE id = $1'
    ];

    try {
      const [favoritesResult, searchesResult, userResult] = await Promise.all([
        pool.query(queries[0], [this.id]),
        pool.query(queries[1], [this.id]),
        pool.query(queries[2], [this.id])
      ]);

      return {
        favoriteCount: parseInt(favoritesResult.rows[0].favorite_count),
        savedSearches: parseInt(searchesResult.rows[0].saved_searches),
        memberSince: userResult.rows[0].created_at
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all users (admin only)
  static async findAll(pagination = {}) {
    const limit = pagination.limit || 20;
    const offset = ((pagination.page || 1) - 1) * limit;

    const query = `
      SELECT id, email, company_name, gstin, phone, is_admin, is_verified, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    try {
      const result = await pool.query(query, [limit, offset]);
      return result.rows.map(row => new User(row));
    } catch (error) {
      throw error;
    }
  }

  // Get total user count
  static async getCount() {
    const query = 'SELECT COUNT(*) FROM users';
    
    try {
      const result = await pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Verify user email
  static async verifyEmail(id) {
    const query = `
      UPDATE users 
      SET is_verified = true 
      WHERE id = $1 
      RETURNING id, email, company_name, gstin, phone, preferences, is_admin, is_verified, created_at, updated_at
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? new User(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    // First verify current password
    const user = await User.findByEmail(this.email);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const query = 'UPDATE users SET password = $1 WHERE id = $2';
    
    try {
      await pool.query(query, [hashedPassword, this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;