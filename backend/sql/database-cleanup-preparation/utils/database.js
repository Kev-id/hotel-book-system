// 数据库连接工具
const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.connection = null;
  }

  async connect() {
    if (!this.pool) {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Wang2006',
        database: process.env.DB_NAME || 'hotel_booking',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    
    this.connection = await this.pool.getConnection();
    return this.connection;
  }

  async query(sql, params = []) {
    if (!this.connection) {
      await this.connect();
    }
    return await this.connection.query(sql, params);
  }

  async execute(sql, params = []) {
    if (!this.connection) {
      await this.connect();
    }
    return await this.connection.execute(sql, params);
  }

  async beginTransaction() {
    if (!this.connection) {
      await this.connect();
    }
    await this.connection.beginTransaction();
  }

  async commit() {
    if (this.connection) {
      await this.connection.commit();
    }
  }

  async rollback() {
    if (this.connection) {
      await this.connection.rollback();
    }
  }

  async close() {
    if (this.connection) {
      this.connection.release();
      this.connection = null;
    }
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  // 重试机制
  async queryWithRetry(sql, params = [], maxRetries = 3) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.query(sql, params);
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await this.sleep(2000 * (i + 1)); // 递增等待时间
        }
      }
    }
    throw lastError;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Database;
