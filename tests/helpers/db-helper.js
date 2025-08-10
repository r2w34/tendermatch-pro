// Database helper utilities for testing
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Pool } from 'pg';
import redis from 'redis-mock';

class DatabaseHelper {
  constructor() {
    this.pgPool = null;
    this.redisClient = null;
    this.mongoServer = null;
  }

  // PostgreSQL Test Database Setup
  async setupPostgreSQL() {
    const config = {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT || 5432,
      database: process.env.TEST_DB_NAME || 'tender_test',
      user: process.env.TEST_DB_USER || 'test',
      password: process.env.TEST_DB_PASSWORD || 'test',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pgPool = new Pool(config);

    try {
      await this.pgPool.query('SELECT NOW()');
      console.log('✅ PostgreSQL test database connected');
    } catch (error) {
      console.warn('⚠️ PostgreSQL not available, using mock database');
      this.pgPool = this.createMockPgPool();
    }

    return this.pgPool;
  }

  // Create mock PostgreSQL pool for CI/CD environments
  createMockPgPool() {
    const mockData = {
      tenders: [],
      users: [],
      subscriptions: [],
      documents: []
    };

    return {
      query: jest.fn().mockImplementation((text, params) => {
        // Mock different query types
        if (text.includes('SELECT') && text.includes('tenders')) {
          return { rows: mockData.tenders };
        }
        if (text.includes('SELECT') && text.includes('users')) {
          return { rows: mockData.users };
        }
        if (text.includes('INSERT') && text.includes('tenders')) {
          const tender = { id: Date.now(), ...params };
          mockData.tenders.push(tender);
          return { rows: [tender] };
        }
        if (text.includes('UPDATE') && text.includes('tenders')) {
          return { rows: [{ id: 1, updated: true }] };
        }
        if (text.includes('DELETE')) {
          return { rows: [{ deleted: true }] };
        }
        return { rows: [] };
      }),
      connect: jest.fn().mockResolvedValue({
        query: jest.fn(),
        release: jest.fn()
      }),
      end: jest.fn().mockResolvedValue()
    };
  }

  // Redis Test Setup
  async setupRedis() {
    try {
      // Try to connect to real Redis for integration tests
      const realRedis = require('redis');
      this.redisClient = realRedis.createClient({
        url: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1'
      });
      
      await this.redisClient.connect();
      await this.redisClient.ping();
      console.log('✅ Redis test database connected');
    } catch (error) {
      console.warn('⚠️ Redis not available, using mock Redis');
      this.redisClient = redis.createClient();
    }

    return this.redisClient;
  }

  // MongoDB Memory Server for document testing
  async setupMongoDB() {
    try {
      this.mongoServer = await MongoMemoryServer.create();
      const mongoUri = this.mongoServer.getUri();
      console.log('✅ MongoDB Memory Server started');
      return mongoUri;
    } catch (error) {
      console.warn('⚠️ MongoDB Memory Server failed to start');
      return null;
    }
  }

  // Seed test data
  async seedTestData() {
    if (!this.pgPool) return;

    const testTenders = [
      {
        id: 'GEM/2024/B/12345',
        title: 'Supply of IT Equipment',
        description: 'Procurement of laptops and desktops for government office',
        department: 'Information Technology',
        state: 'Maharashtra',
        city: 'Mumbai',
        budget: 5000000,
        published_date: '2024-01-15',
        deadline_date: '2024-02-15',
        status: 'Active',
        category: 'IT Equipment'
      },
      {
        id: 'GEM/2024/B/12346',
        title: 'Construction of School Building',
        description: 'Construction of new primary school building',
        department: 'Education',
        state: 'Karnataka',
        city: 'Bangalore',
        budget: 25000000,
        published_date: '2024-01-10',
        deadline_date: '2024-02-10',
        status: 'Closing Soon',
        category: 'Construction'
      }
    ];

    const testUsers = [
      {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        company: 'Test Company',
        phone: '+91-9876543210',
        password_hash: '$2b$10$test.hash.here',
        verified: true,
        subscription_plan: 'basic'
      }
    ];

    try {
      // Insert test tenders
      for (const tender of testTenders) {
        await this.pgPool.query(`
          INSERT INTO tenders (id, title, description, department, state, city, budget, published_date, deadline_date, status, category)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING
        `, Object.values(tender));
      }

      // Insert test users
      for (const user of testUsers) {
        await this.pgPool.query(`
          INSERT INTO users (id, email, name, company, phone, password_hash, verified, subscription_plan)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (email) DO NOTHING
        `, Object.values(user));
      }

      console.log('✅ Test data seeded successfully');
    } catch (error) {
      console.warn('⚠️ Failed to seed test data:', error.message);
    }
  }

  // Clean up test data
  async cleanupTestData() {
    if (!this.pgPool) return;

    try {
      await this.pgPool.query('DELETE FROM tenders WHERE id LIKE $1', ['GEM/2024/B/%']);
      await this.pgPool.query('DELETE FROM users WHERE email LIKE $1', ['%@example.com']);
      await this.pgPool.query('DELETE FROM documents WHERE created_at > $1', [new Date(Date.now() - 24 * 60 * 60 * 1000)]);
      console.log('✅ Test data cleaned up');
    } catch (error) {
      console.warn('⚠️ Failed to cleanup test data:', error.message);
    }
  }

  // Create test database schema
  async createTestSchema() {
    if (!this.pgPool) return;

    const schema = `
      CREATE TABLE IF NOT EXISTS tenders (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        department VARCHAR(100),
        state VARCHAR(50),
        city VARCHAR(50),
        budget BIGINT,
        published_date DATE,
        deadline_date DATE,
        status VARCHAR(20),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100),
        company VARCHAR(200),
        phone VARCHAR(20),
        password_hash VARCHAR(255),
        verified BOOLEAN DEFAULT FALSE,
        subscription_plan VARCHAR(20) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        tender_id VARCHAR(50) REFERENCES tenders(id),
        filename VARCHAR(255),
        file_path VARCHAR(500),
        file_size INTEGER,
        mime_type VARCHAR(100),
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        tender_id VARCHAR(50) REFERENCES tenders(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tender_id)
      );

      CREATE INDEX IF NOT EXISTS idx_tenders_state ON tenders(state);
      CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category);
      CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
      CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON tenders(deadline_date);
    `;

    try {
      await this.pgPool.query(schema);
      console.log('✅ Test database schema created');
    } catch (error) {
      console.warn('⚠️ Failed to create test schema:', error.message);
    }
  }

  // Teardown all database connections
  async teardown() {
    try {
      if (this.pgPool) {
        await this.pgPool.end();
        console.log('✅ PostgreSQL connection closed');
      }

      if (this.redisClient) {
        await this.redisClient.quit();
        console.log('✅ Redis connection closed');
      }

      if (this.mongoServer) {
        await this.mongoServer.stop();
        console.log('✅ MongoDB Memory Server stopped');
      }
    } catch (error) {
      console.warn('⚠️ Error during database teardown:', error.message);
    }
  }

  // Get database statistics for performance testing
  async getDatabaseStats() {
    if (!this.pgPool) return {};

    try {
      const tenderCount = await this.pgPool.query('SELECT COUNT(*) FROM tenders');
      const userCount = await this.pgPool.query('SELECT COUNT(*) FROM users');
      const documentCount = await this.pgPool.query('SELECT COUNT(*) FROM documents');

      return {
        tenders: parseInt(tenderCount.rows[0].count),
        users: parseInt(userCount.rows[0].count),
        documents: parseInt(documentCount.rows[0].count)
      };
    } catch (error) {
      console.warn('⚠️ Failed to get database stats:', error.message);
      return {};
    }
  }
}

// Singleton instance
const dbHelper = new DatabaseHelper();

export default dbHelper;

// Convenience functions
export const setupTestDatabase = async () => {
  await dbHelper.setupPostgreSQL();
  await dbHelper.setupRedis();
  await dbHelper.createTestSchema();
  await dbHelper.seedTestData();
  return dbHelper;
};

export const cleanupTestDatabase = async () => {
  await dbHelper.cleanupTestData();
  await dbHelper.teardown();
};