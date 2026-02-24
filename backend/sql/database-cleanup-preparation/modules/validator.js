// 架构验证模块
class SchemaValidator {
  constructor(db) {
    this.db = db;
    this.requiredTables = [
      'users',
      'hotels',
      'room_types',
      'orders',
      'reviews',
      'favorites',
      'price_history'
    ];
    
    // AI相关表（可选，如果不存在会警告但不会停止）
    this.optionalTables = [
      'review_ai_cache',
      'review_quality_flags'
    ];
    
    this.requiredColumns = {
      reviews: ['sentiment', 'dimensions', 'tags', 'content', 'overall_rating']
    };
    
    this.errors = [];
    this.warnings = [];
  }

  async validate() {
    this.errors = [];
    this.warnings = [];
    
    // 验证必需的表
    await this.validateTables();
    
    // 验证必需的列
    await this.validateColumns();
    
    // 验证基础数据
    await this.validateBaseData();
    
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  async validateTables() {
    try {
      // 获取所有表
      const [tables] = await this.db.query('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      
      // 检查必需的表
      for (const tableName of this.requiredTables) {
        if (!tableNames.includes(tableName)) {
          this.errors.push({
            type: 'MISSING_TABLE',
            table: tableName,
            message: `缺失必需的表: ${tableName}`
          });
        }
      }
      
      // 检查可选的表
      for (const tableName of this.optionalTables) {
        if (!tableNames.includes(tableName)) {
          this.warnings.push({
            type: 'MISSING_OPTIONAL_TABLE',
            table: tableName,
            message: `缺失可选的表: ${tableName}（AI功能可能受限）`
          });
        }
      }
    } catch (error) {
      this.errors.push({
        type: 'VALIDATION_ERROR',
        message: `验证表时出错: ${error.message}`
      });
    }
  }

  async validateColumns() {
    try {
      for (const [tableName, columns] of Object.entries(this.requiredColumns)) {
        // 检查表是否存在
        const [tables] = await this.db.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);
        
        if (!tableNames.includes(tableName)) {
          continue; // 表不存在，已在validateTables中报告
        }
        
        // 获取表的列
        const [tableColumns] = await this.db.query(`SHOW COLUMNS FROM ${tableName}`);
        const columnNames = tableColumns.map(col => col.Field);
        
        // 检查必需的列
        for (const columnName of columns) {
          if (!columnNames.includes(columnName)) {
            this.errors.push({
              type: 'MISSING_COLUMN',
              table: tableName,
              column: columnName,
              message: `表 ${tableName} 缺失必需的列: ${columnName}`
            });
          }
        }
      }
    } catch (error) {
      this.errors.push({
        type: 'VALIDATION_ERROR',
        message: `验证列时出错: ${error.message}`
      });
    }
  }

  async validateBaseData() {
    try {
      // 检查users表是否有数据
      const [users] = await this.db.query('SELECT COUNT(*) as count FROM users');
      if (users[0].count === 0) {
        this.errors.push({
          type: 'EMPTY_TABLE',
          table: 'users',
          message: '用户表为空，请先运行 init.js 初始化基础数据'
        });
      }
      
      // 检查hotels表是否有数据
      const [hotels] = await this.db.query('SELECT COUNT(*) as count FROM hotels');
      if (hotels[0].count === 0) {
        this.errors.push({
          type: 'EMPTY_TABLE',
          table: 'hotels',
          message: '酒店表为空，请先运行 init.js 初始化基础数据'
        });
      }
      
      // 检查room_types表是否有数据
      const [roomTypes] = await this.db.query('SELECT COUNT(*) as count FROM room_types');
      if (roomTypes[0].count === 0) {
        this.errors.push({
          type: 'EMPTY_TABLE',
          table: 'room_types',
          message: '房型表为空，请先运行 init.js 初始化基础数据'
        });
      }
    } catch (error) {
      this.errors.push({
        type: 'VALIDATION_ERROR',
        message: `验证基础数据时出错: ${error.message}`
      });
    }
  }
}

module.exports = SchemaValidator;
