/**
 * Task13: AI增强收藏对比系统 - 数据库迁移
 * 创建收藏表、浏览历史表、AI调用日志表
 */

const db = require('../config/database');

async function migrate() {
  console.log('开始迁移 Task13 数据库...');

  try {
    // 1. 创建收藏表
    console.log('创建 favorites 表...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        hotel_id INT NOT NULL,
        category VARCHAR(50),
        ai_reason TEXT,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_favorite (user_id, hotel_id),
        INDEX idx_user_category (user_id, category),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表'
    `);
    console.log('✓ favorites 表创建成功');

    // 2. 创建浏览历史表
    console.log('创建 browse_history 表...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS browse_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        hotel_id INT NOT NULL,
        browse_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration INT DEFAULT 0,
        INDEX idx_user_browse_time (user_id, browse_time),
        INDEX idx_user_hotel_time (user_id, hotel_id, browse_time),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户浏览历史表'
    `);
    console.log('✓ browse_history 表创建成功');

    // 3. 创建AI调用日志表
    console.log('创建 ai_call_logs 表...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS ai_call_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        service_type VARCHAR(50) NOT NULL,
        prompt_length INT NOT NULL,
        duration_ms INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_service_status (service_type, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI调用日志表'
    `);
    console.log('✓ ai_call_logs 表创建成功');

    console.log('\n✅ Task13 数据库迁移完成！');
    console.log('\n创建的表：');
    console.log('  - favorites (收藏表)');
    console.log('  - browse_history (浏览历史表)');
    console.log('  - ai_call_logs (AI调用日志表)');

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

migrate();
