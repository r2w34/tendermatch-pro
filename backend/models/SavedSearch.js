const { pool } = require('../config/database');

class SavedSearch {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.name = data.name;
    this.search_criteria = data.search_criteria;
    this.alert_enabled = data.alert_enabled;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new saved search
  static async create(searchData) {
    const { user_id, name, search_criteria, alert_enabled } = searchData;

    const query = `
      INSERT INTO saved_searches (user_id, name, search_criteria, alert_enabled)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      user_id,
      name,
      JSON.stringify(search_criteria),
      alert_enabled !== undefined ? alert_enabled : true
    ];

    try {
      const result = await pool.query(query, values);
      return new SavedSearch(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find saved search by ID
  static async findById(id) {
    const query = 'SELECT * FROM saved_searches WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? new SavedSearch(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all saved searches for a user
  static async findByUserId(userId, pagination = {}) {
    const limit = pagination.limit || 20;
    const offset = ((pagination.page || 1) - 1) * limit;

    const query = `
      SELECT * FROM saved_searches 
      WHERE user_id = $1 
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows.map(row => new SavedSearch(row));
    } catch (error) {
      throw error;
    }
  }

  // Update saved search
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'user_id') {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        
        if (key === 'search_criteria') {
          values.push(JSON.stringify(updateData[key]));
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
      UPDATE saved_searches 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? new SavedSearch(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Delete saved search
  static async delete(id) {
    const query = 'DELETE FROM saved_searches WHERE id = $1 RETURNING *';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Check if user owns the saved search
  static async isOwner(searchId, userId) {
    const query = 'SELECT id FROM saved_searches WHERE id = $1 AND user_id = $2';
    
    try {
      const result = await pool.query(query, [searchId, userId]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get count of saved searches for a user
  static async getCountByUserId(userId) {
    const query = 'SELECT COUNT(*) FROM saved_searches WHERE user_id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Get all saved searches with alerts enabled (for notification service)
  static async findWithAlertsEnabled() {
    const query = `
      SELECT ss.*, u.email, u.company_name
      FROM saved_searches ss
      INNER JOIN users u ON ss.user_id = u.id
      WHERE ss.alert_enabled = true AND u.is_verified = true
      ORDER BY ss.created_at DESC
    `;

    try {
      const result = await pool.query(query);
      return result.rows.map(row => ({
        ...new SavedSearch(row),
        user_email: row.email,
        user_company: row.company_name
      }));
    } catch (error) {
      throw error;
    }
  }

  // Execute saved search to find matching tenders
  async executeSearch(pagination = {}) {
    const criteria = this.search_criteria;
    let query = 'SELECT * FROM tenders WHERE status = $1';
    const values = ['active'];
    let paramCount = 1;

    // Apply search criteria
    if (criteria.keyword) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${criteria.keyword}%`);
    }

    if (criteria.state) {
      paramCount++;
      query += ` AND state = $${paramCount}`;
      values.push(criteria.state);
    }

    if (criteria.city) {
      paramCount++;
      query += ` AND city ILIKE $${paramCount}`;
      values.push(`%${criteria.city}%`);
    }

    if (criteria.category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(criteria.category);
    }

    if (criteria.department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      values.push(criteria.department);
    }

    if (criteria.minBudget) {
      paramCount++;
      query += ` AND budget_min >= $${paramCount}`;
      values.push(criteria.minBudget);
    }

    if (criteria.maxBudget) {
      paramCount++;
      query += ` AND budget_max <= $${paramCount}`;
      values.push(criteria.maxBudget);
    }

    if (criteria.startDate) {
      paramCount++;
      query += ` AND publish_date >= $${paramCount}`;
      values.push(criteria.startDate);
    }

    if (criteria.endDate) {
      paramCount++;
      query += ` AND bid_deadline <= $${paramCount}`;
      values.push(criteria.endDate);
    }

    // Apply sorting
    query += ' ORDER BY created_at DESC';

    // Apply pagination
    const limit = pagination.limit || 20;
    const offset = ((pagination.page || 1) - 1) * limit;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    values.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    values.push(offset);

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get count of matching tenders for saved search
  async getMatchingCount() {
    const criteria = this.search_criteria;
    let query = 'SELECT COUNT(*) FROM tenders WHERE status = $1';
    const values = ['active'];
    let paramCount = 1;

    // Apply same criteria as executeSearch
    if (criteria.keyword) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${criteria.keyword}%`);
    }

    if (criteria.state) {
      paramCount++;
      query += ` AND state = $${paramCount}`;
      values.push(criteria.state);
    }

    if (criteria.city) {
      paramCount++;
      query += ` AND city ILIKE $${paramCount}`;
      values.push(`%${criteria.city}%`);
    }

    if (criteria.category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(criteria.category);
    }

    if (criteria.department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      values.push(criteria.department);
    }

    if (criteria.minBudget) {
      paramCount++;
      query += ` AND budget_min >= $${paramCount}`;
      values.push(criteria.minBudget);
    }

    if (criteria.maxBudget) {
      paramCount++;
      query += ` AND budget_max <= $${paramCount}`;
      values.push(criteria.maxBudget);
    }

    if (criteria.startDate) {
      paramCount++;
      query += ` AND publish_date >= $${paramCount}`;
      values.push(criteria.startDate);
    }

    if (criteria.endDate) {
      paramCount++;
      query += ` AND bid_deadline <= $${paramCount}`;
      values.push(criteria.endDate);
    }

    try {
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Find new tenders matching saved search (for alerts)
  async findNewMatches(sinceDate) {
    const criteria = this.search_criteria;
    let query = 'SELECT * FROM tenders WHERE status = $1 AND created_at > $2';
    const values = ['active', sinceDate];
    let paramCount = 2;

    // Apply search criteria
    if (criteria.keyword) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${criteria.keyword}%`);
    }

    if (criteria.state) {
      paramCount++;
      query += ` AND state = $${paramCount}`;
      values.push(criteria.state);
    }

    if (criteria.city) {
      paramCount++;
      query += ` AND city ILIKE $${paramCount}`;
      values.push(`%${criteria.city}%`);
    }

    if (criteria.category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(criteria.category);
    }

    if (criteria.department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      values.push(criteria.department);
    }

    if (criteria.minBudget) {
      paramCount++;
      query += ` AND budget_min >= $${paramCount}`;
      values.push(criteria.minBudget);
    }

    if (criteria.maxBudget) {
      paramCount++;
      query += ` AND budget_max <= $${paramCount}`;
      values.push(criteria.maxBudget);
    }

    query += ' ORDER BY created_at DESC LIMIT 50'; // Limit to prevent spam

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Toggle alert status
  async toggleAlert() {
    const query = `
      UPDATE saved_searches 
      SET alert_enabled = NOT alert_enabled 
      WHERE id = $1 
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [this.id]);
      if (result.rows.length > 0) {
        this.alert_enabled = result.rows[0].alert_enabled;
        return this;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SavedSearch;