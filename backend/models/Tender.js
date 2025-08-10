const { pool } = require('../config/database');
const { TENDER_STATUS, SORT_OPTIONS } = require('../config/constants');

class Tender {
  constructor(data) {
    this.id = data.id;
    this.tender_ref_no = data.tender_ref_no;
    this.title = data.title;
    this.description = data.description;
    this.department = data.department;
    this.state = data.state;
    this.city = data.city;
    this.budget_min = data.budget_min;
    this.budget_max = data.budget_max;
    this.publish_date = data.publish_date;
    this.bid_deadline = data.bid_deadline;
    this.category = data.category;
    this.source_portal = data.source_portal;
    this.source_url = data.source_url;
    this.documents = data.documents;
    this.eligibility_criteria = data.eligibility_criteria;
    this.contact_details = data.contact_details;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new tender
  static async create(tenderData) {
    const query = `
      INSERT INTO tenders (
        tender_ref_no, title, description, department, state, city,
        budget_min, budget_max, publish_date, bid_deadline, category,
        source_portal, source_url, documents, eligibility_criteria,
        contact_details, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      tenderData.tender_ref_no,
      tenderData.title,
      tenderData.description,
      tenderData.department,
      tenderData.state,
      tenderData.city,
      tenderData.budget_min,
      tenderData.budget_max,
      tenderData.publish_date,
      tenderData.bid_deadline,
      tenderData.category,
      tenderData.source_portal || 'GeM',
      tenderData.source_url,
      JSON.stringify(tenderData.documents || []),
      JSON.stringify(tenderData.eligibility_criteria || {}),
      JSON.stringify(tenderData.contact_details || {}),
      tenderData.status || TENDER_STATUS.ACTIVE
    ];

    try {
      const result = await pool.query(query, values);
      return new Tender(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find tender by ID
  static async findById(id) {
    const query = 'SELECT * FROM tenders WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? new Tender(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Find tender by reference number
  static async findByRefNo(refNo) {
    const query = 'SELECT * FROM tenders WHERE tender_ref_no = $1';
    
    try {
      const result = await pool.query(query, [refNo]);
      return result.rows.length > 0 ? new Tender(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Get all tenders with filters and pagination
  static async findAll(filters = {}, pagination = {}) {
    let query = 'SELECT * FROM tenders WHERE 1=1';
    const values = [];
    let paramCount = 0;

    // Apply filters
    if (filters.keyword) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${filters.keyword}%`);
    }

    if (filters.state) {
      paramCount++;
      query += ` AND state = $${paramCount}`;
      values.push(filters.state);
    }

    if (filters.city) {
      paramCount++;
      query += ` AND city ILIKE $${paramCount}`;
      values.push(`%${filters.city}%`);
    }

    if (filters.category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      values.push(filters.department);
    }

    if (filters.minBudget) {
      paramCount++;
      query += ` AND budget_min >= $${paramCount}`;
      values.push(filters.minBudget);
    }

    if (filters.maxBudget) {
      paramCount++;
      query += ` AND budget_max <= $${paramCount}`;
      values.push(filters.maxBudget);
    }

    if (filters.status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
    } else {
      // Default to active tenders only
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(TENDER_STATUS.ACTIVE);
    }

    if (filters.startDate) {
      paramCount++;
      query += ` AND publish_date >= $${paramCount}`;
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      query += ` AND bid_deadline <= $${paramCount}`;
      values.push(filters.endDate);
    }

    // Apply sorting
    const sortBy = filters.sortBy || SORT_OPTIONS.LATEST;
    switch (sortBy) {
      case SORT_OPTIONS.LATEST:
        query += ' ORDER BY created_at DESC';
        break;
      case SORT_OPTIONS.DEADLINE_ASC:
        query += ' ORDER BY bid_deadline ASC';
        break;
      case SORT_OPTIONS.BUDGET_DESC:
        query += ' ORDER BY budget_max DESC';
        break;
      case SORT_OPTIONS.BUDGET_ASC:
        query += ' ORDER BY budget_min ASC';
        break;
      case SORT_OPTIONS.TITLE_ASC:
        query += ' ORDER BY title ASC';
        break;
      default:
        query += ' ORDER BY created_at DESC';
    }

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
      return result.rows.map(row => new Tender(row));
    } catch (error) {
      throw error;
    }
  }

  // Get total count with filters
  static async getCount(filters = {}) {
    let query = 'SELECT COUNT(*) FROM tenders WHERE 1=1';
    const values = [];
    let paramCount = 0;

    // Apply same filters as findAll
    if (filters.keyword) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${filters.keyword}%`);
    }

    if (filters.state) {
      paramCount++;
      query += ` AND state = $${paramCount}`;
      values.push(filters.state);
    }

    if (filters.city) {
      paramCount++;
      query += ` AND city ILIKE $${paramCount}`;
      values.push(`%${filters.city}%`);
    }

    if (filters.category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      values.push(filters.department);
    }

    if (filters.minBudget) {
      paramCount++;
      query += ` AND budget_min >= $${paramCount}`;
      values.push(filters.minBudget);
    }

    if (filters.maxBudget) {
      paramCount++;
      query += ` AND budget_max <= $${paramCount}`;
      values.push(filters.maxBudget);
    }

    if (filters.status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
    } else {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      values.push(TENDER_STATUS.ACTIVE);
    }

    if (filters.startDate) {
      paramCount++;
      query += ` AND publish_date >= $${paramCount}`;
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      query += ` AND bid_deadline <= $${paramCount}`;
      values.push(filters.endDate);
    }

    try {
      const result = await pool.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  // Update tender
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        
        // Handle JSON fields
        if (['documents', 'eligibility_criteria', 'contact_details'].includes(key)) {
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
      UPDATE tenders 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? new Tender(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Soft delete tender
  static async delete(id) {
    const query = 'UPDATE tenders SET status = $1 WHERE id = $2 RETURNING *';
    
    try {
      const result = await pool.query(query, [TENDER_STATUS.CANCELLED, id]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard statistics
  static async getStats() {
    const queries = [
      'SELECT COUNT(*) as total FROM tenders WHERE status = $1',
      'SELECT COUNT(*) as active FROM tenders WHERE status = $1 AND bid_deadline > NOW()',
      'SELECT COUNT(*) as closing_soon FROM tenders WHERE status = $1 AND bid_deadline BETWEEN NOW() AND NOW() + INTERVAL \'7 days\'',
      'SELECT category, COUNT(*) as count FROM tenders WHERE status = $1 GROUP BY category',
      'SELECT state, COUNT(*) as count FROM tenders WHERE status = $1 GROUP BY state ORDER BY count DESC LIMIT 10'
    ];

    try {
      const [totalResult, activeResult, closingSoonResult, categoryResult, stateResult] = await Promise.all([
        pool.query(queries[0], [TENDER_STATUS.ACTIVE]),
        pool.query(queries[1], [TENDER_STATUS.ACTIVE]),
        pool.query(queries[2], [TENDER_STATUS.ACTIVE]),
        pool.query(queries[3], [TENDER_STATUS.ACTIVE]),
        pool.query(queries[4], [TENDER_STATUS.ACTIVE])
      ]);

      return {
        total: parseInt(totalResult.rows[0].total),
        active: parseInt(activeResult.rows[0].active),
        closingSoon: parseInt(closingSoonResult.rows[0].closing_soon),
        byCategory: categoryResult.rows,
        byState: stateResult.rows
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if tender exists by reference number
  static async existsByRefNo(refNo) {
    const query = 'SELECT id FROM tenders WHERE tender_ref_no = $1';
    
    try {
      const result = await pool.query(query, [refNo]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Bulk insert tenders (for scraping)
  static async bulkInsert(tenders) {
    if (!tenders || tenders.length === 0) {
      return [];
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const insertedTenders = [];
      
      for (const tenderData of tenders) {
        // Check if tender already exists
        const existsResult = await client.query(
          'SELECT id FROM tenders WHERE tender_ref_no = $1',
          [tenderData.tender_ref_no]
        );
        
        if (existsResult.rows.length === 0) {
          // Insert new tender
          const insertQuery = `
            INSERT INTO tenders (
              tender_ref_no, title, description, department, state, city,
              budget_min, budget_max, publish_date, bid_deadline, category,
              source_portal, source_url, documents, eligibility_criteria,
              contact_details, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
          `;
          
          const values = [
            tenderData.tender_ref_no,
            tenderData.title,
            tenderData.description,
            tenderData.department,
            tenderData.state,
            tenderData.city,
            tenderData.budget_min,
            tenderData.budget_max,
            tenderData.publish_date,
            tenderData.bid_deadline,
            tenderData.category,
            tenderData.source_portal || 'GeM',
            tenderData.source_url,
            JSON.stringify(tenderData.documents || []),
            JSON.stringify(tenderData.eligibility_criteria || {}),
            JSON.stringify(tenderData.contact_details || {}),
            tenderData.status || TENDER_STATUS.ACTIVE
          ];
          
          const result = await client.query(insertQuery, values);
          insertedTenders.push(new Tender(result.rows[0]));
        }
      }
      
      await client.query('COMMIT');
      return insertedTenders;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Tender;