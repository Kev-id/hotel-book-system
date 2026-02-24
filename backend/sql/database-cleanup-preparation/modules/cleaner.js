// 数据清理模块
class DataCleaner {
  constructor(db) {
    this.db = db;
    this.tablesToClean = [
      'orders',
      'reviews',
      'favorites',
      'price_history'
    ];
    
    this.optionalTablesToClean = [
      'review_ai_cache',
      'review_quality_flags'
    ];
    
    this.tablesToPreserve = [
      'users',
      'hotels',
      'room_types',
      'price_calendar'
    ];
  }

  async clean() {
    try {
      await this.db.beginTransaction();
      
      // 清理必需的表
      for (const table of this.tablesToClean) {
        await this.cleanTable(table);
      }
      
      // 清理可选的表（如果存在）
      for (const table of this.optionalTablesToClean) {
        await this.cleanTableIfExists(table);
      }
      
      await this.db.commit();
      
      return {
        success: true,
        cleaned: [...this.tablesToClean, ...this.optionalTablesToClean],
        preserved: this.tablesToPreserve
      };
    } catch (error) {
      await this.db.rollback();
      throw error;
    }
  }

  async cleanTable(tableName) {
    try {
      // 使用TRUNCATE清空表（保留表结构）
      await this.db.query(`TRUNCATE TABLE ${tableName}`);
    } catch (error) {
      // 如果TRUNCATE失败（可能因为外键约束），使用DELETE
      try {
        await this.db.query(`DELETE FROM ${tableName}`);
      } catch (deleteError) {
        throw new Error(`清理表 ${tableName} 失败: ${deleteError.message}`);
      }
    }
  }

  async cleanTableIfExists(tableName) {
    try {
      // 检查表是否存在
      const [tables] = await this.db.query('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      
      if (tableNames.includes(tableName)) {
        await this.cleanTable(tableName);
      }
    } catch (error) {
      // 忽略可选表的清理错误
      console.warn(`警告: 清理可选表 ${tableName} 时出错: ${error.message}`);
    }
  }

  async getTableCounts() {
    const counts = {};
    
    for (const table of this.tablesToClean) {
      try {
        const [result] = await this.db.query(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = result[0].count;
      } catch (error) {
        counts[table] = 0;
      }
    }
    
    return counts;
  }

  async verifyClean() {
    const counts = await this.getTableCounts();
    const allClean = Object.values(counts).every(count => count === 0);
    
    return {
      clean: allClean,
      counts
    };
  }
}

module.exports = DataCleaner;
