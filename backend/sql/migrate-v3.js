const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
  database: process.env.DB_NAME || 'hotel_booking',
});

const migrate = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('🚀 开始数据库迁移 v3.0\n');

    // 1. 扩展 hotels 表
    console.log('📊 扩展 hotels 表...');
    
    const hotelColumns = [
      { name: 'rating', type: 'DECIMAL(2,1) DEFAULT 0', desc: '评分' },
      { name: 'review_count', type: 'INT DEFAULT 0', desc: '评价数量' },
      { name: 'tags', type: 'JSON', desc: '标签' },
      { name: 'facilities', type: 'JSON', desc: '设施' },
      { name: 'images', type: 'JSON', desc: '图片' },
      { name: 'coordinates', type: 'JSON', desc: '坐标' },
      { name: 'check_in_time', type: 'VARCHAR(10) DEFAULT "14:00"', desc: '入住时间' },
      { name: 'check_out_time', type: 'VARCHAR(10) DEFAULT "12:00"', desc: '离店时间' },
      { name: 'cancel_policy', type: 'JSON', desc: '取消政策' },
      { name: 'description', type: 'TEXT', desc: '描述' }
    ];

    for (const col of hotelColumns) {
      try {
        await conn.query(`ALTER TABLE hotels ADD COLUMN ${col.name} ${col.type}`);
        console.log(`  ✓ 添加 ${col.name} 列 (${col.desc})`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ✓ ${col.name} 列已存在`);
        } else {
          throw err;
        }
      }
    }

    // 2. 创建 orders 表
    console.log('\n📋 创建 orders 表...');
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(20) PRIMARY KEY,
          user_id INT NOT NULL,
          hotel_id INT NOT NULL,
          room_type VARCHAR(50),
          status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled') DEFAULT 'pending',
          check_in_date DATE NOT NULL,
          check_out_date DATE NOT NULL,
          nights INT NOT NULL,
          adults INT DEFAULT 1,
          children INT DEFAULT 0,
          total_price DECIMAL(10,2) NOT NULL,
          create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          cancel_deadline DATETIME,
          cancel_policy JSON,
          logs JSON,
          risk_flags JSON,
          INDEX idx_user_id (user_id),
          INDEX idx_hotel_id (hotel_id),
          INDEX idx_status (status),
          INDEX idx_check_in (check_in_date),
          INDEX idx_create_time (create_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('  ✓ orders 表创建成功');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('  ✓ orders 表已存在');
      } else {
        throw err;
      }
    }

    // 3. 创建 reviews 表
    console.log('\n💬 创建 reviews 表...');
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          hotel_id INT NOT NULL,
          order_id VARCHAR(20),
          overall_rating DECIMAL(2,1) NOT NULL,
          dimensions JSON NOT NULL COMMENT '5维度评分',
          content TEXT,
          images JSON,
          tags JSON,
          sentiment ENUM('positive', 'neutral', 'negative'),
          helpful INT DEFAULT 0,
          reported BOOLEAN DEFAULT FALSE,
          merchant_reply JSON,
          create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_hotel_id (hotel_id),
          INDEX idx_user_id (user_id),
          INDEX idx_rating (overall_rating),
          INDEX idx_create_time (create_time),
          INDEX idx_sentiment (sentiment)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('  ✓ reviews 表创建成功');
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('  ✓ reviews 表已存在');
      } else {
        throw err;
      }
    }

    // 4. 扩展 users 表
    console.log('\n👥 扩展 users 表...');
    
    const userColumns = [
      { name: 'email', type: 'VARCHAR(100)', desc: '邮箱' },
      { name: 'phone', type: 'VARCHAR(20)', desc: '手机号' },
      { name: 'preferences', type: 'JSON', desc: '用户偏好' },
      { name: 'favorites', type: 'JSON', desc: '收藏列表' }
    ];

    for (const col of userColumns) {
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`  ✓ 添加 ${col.name} 列 (${col.desc})`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ✓ ${col.name} 列已存在`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ 数据库迁移完成！');
    console.log('\n📊 表结构:');
    console.log('  - hotels: 扩展字段（rating, tags, facilities, coordinates等）');
    console.log('  - orders: 新建（订单管理）');
    console.log('  - reviews: 新建（评价系统）');
    console.log('  - users: 扩展字段（preferences, favorites）');
    console.log('\n🎯 下一步: 运行数据导入脚本');
    console.log('  node backend/sql/import-data.js\n');

  } catch (error) {
    console.error('\n❌ 迁移失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
};

migrate();
