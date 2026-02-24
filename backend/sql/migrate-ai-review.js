const pool = require('../config/database');

async function migrateAIReview() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('开始AI评价系统数据库迁移...');
    
    // 创建AI缓存表
    console.log('创建 review_ai_cache 表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS review_ai_cache (
        id INT PRIMARY KEY AUTO_INCREMENT,
        hotel_id INT NOT NULL,
        cache_type VARCHAR(50) NOT NULL,
        cache_key VARCHAR(100) NOT NULL,
        cache_data JSON NOT NULL,
        reviews_count INT NOT NULL,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expire_time TIMESTAMP NOT NULL,
        INDEX idx_hotel_type_key (hotel_id, cache_type, cache_key),
        INDEX idx_expire (expire_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI分析缓存表（✅ P1-1修复：新增cache_key字段）'
    `);
    
    // 创建质量标记表
    console.log('创建 review_quality_flags 表...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS review_quality_flags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        review_id INT NOT NULL,
        flag_type VARCHAR(50) NOT NULL,
        confidence DECIMAL(3,2) NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_review (review_id),
        INDEX idx_status (status),
        INDEX idx_status_created (status, create_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价质量标记表（✅ P1-1修复：新增复合索引）'
    `);
    
    await connection.commit();
    console.log('✅ AI评价系统数据库迁移完成');
    
    // 显示表结构
    const [cacheTable] = await connection.query('DESCRIBE review_ai_cache');
    console.log('\n✅ review_ai_cache 表结构:');
    console.table(cacheTable);
    
    const [flagsTable] = await connection.query('DESCRIBE review_quality_flags');
    console.log('\n✅ review_quality_flags 表结构:');
    console.table(flagsTable);
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ 迁移失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateAIReview()
    .then(() => {
      console.log('\n🎉 迁移成功完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 迁移失败:', error);
      process.exit(1);
    });
}

module.exports = migrateAIReview;
