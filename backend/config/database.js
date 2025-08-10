const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

// Database initialization
const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await createTables();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Create ENUM types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE tender_category AS ENUM ('IT Equipment', 'Construction', 'Consultancy Services', 'Medical Equipment', 'Office Supplies', 'Transportation', 'Infrastructure', 'Software Development');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE tender_status AS ENUM ('active', 'closed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE source_portal AS ENUM ('GeM', 'CPPP', 'State');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tenders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tender_ref_no VARCHAR(100) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        department VARCHAR(200),
        state VARCHAR(100),
        city VARCHAR(100),
        budget_min DECIMAL(15,2),
        budget_max DECIMAL(15,2),
        publish_date TIMESTAMP,
        bid_deadline TIMESTAMP,
        category tender_category,
        source_portal source_portal DEFAULT 'GeM',
        source_url TEXT,
        documents JSONB DEFAULT '[]',
        eligibility_criteria JSONB DEFAULT '{}',
        contact_details JSONB DEFAULT '{}',
        status tender_status DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        company_name VARCHAR(200),
        gstin VARCHAR(15),
        phone VARCHAR(15),
        preferences JSONB DEFAULT '{}',
        is_admin BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create saved_searches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_searches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        search_criteria JSONB NOT NULL,
        alert_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tender_id)
      )
    `);

    // Create scraping_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scraping_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        portal source_portal NOT NULL,
        status VARCHAR(20) NOT NULL,
        tenders_found INTEGER DEFAULT 0,
        tenders_new INTEGER DEFAULT 0,
        tenders_updated INTEGER DEFAULT 0,
        error_message TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tenders_state ON tenders(state)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON tenders(bid_deadline)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tenders_budget ON tenders(budget_min, budget_max)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tenders_created_at ON tenders(created_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id)');

    // Create trigger for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_tenders_updated_at ON tenders;
      CREATE TRIGGER update_tenders_updated_at
        BEFORE UPDATE ON tenders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initializeDatabase,
  query: (text, params) => pool.query(text, params),
};