const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Wang2006',
});

const initDB = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    const dbName = process.env.DB_NAME || 'hotel_booking';

    // 创建数据库
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ 数据库 ${dbName} 创建成功`);

    // 选择数据库
    await conn.query(`USE ${dbName}`);

    // 创建用户表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        role ENUM('admin', 'merchant', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ users 表创建成功');

    // 创建酒店表（移除 price 和 roomType 字段）
    await conn.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(200) NOT NULL,
        city VARCHAR(50),
        status ENUM('pending', 'published', 'rejected') DEFAULT 'pending',
        rejectReason VARCHAR(500),
        merchantId INT,
        openingDate DATE,
        stars INT,
        tags JSON,
        description TEXT,
        images JSON,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchantId) REFERENCES users(id)
      )
    `);
    console.log('✓ hotels 表创建成功');

    // 创建房型表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS room_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotelId INT NOT NULL,
        roomType VARCHAR(50) NOT NULL,
        price INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotelId) REFERENCES hotels(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ room_types 表创建成功');

    // 插入用户数据
    await conn.query(`
      INSERT IGNORE INTO users (id, username, password, email, phone, role) VALUES
      (1, 'admin1', '123456', NULL, NULL, 'admin'),
      (2, 'merchant1', '123456', NULL, NULL, 'merchant'),
      (3, '陈凯文', 'Kv20060426', '123@qq.com', '18017402610', 'merchant'),
      (4, 'icc', 'Wang2006', NULL, NULL, 'admin'),
      (5, 'user1', '123456', NULL, NULL, 'user')
    `);
    console.log('✓ 用户数据插入成功');

    // 插入酒店数据（4个酒店，使用在线图片）
    await conn.query(`
      INSERT IGNORE INTO hotels (id, name, address, city, status, merchantId, openingDate, stars, tags, description, images) VALUES
      (1, '北京国际大饭店', '北京市朝阳区建国门外大街1号', 'beijing', 'published', 2, '2015-03-15', 5, 
       '["WiFi", "停车场", "健身房", "游泳池", "SPA"]', 
       '五星级豪华酒店，拥有完善的娱乐和休闲设施，提供顶级的住宿体验。',
       '["/uploads/hotels/0.png", "/uploads/hotels/1.png"]'),
      
      (2, '上海外滩华尔道夫酒店', '上海市黄浦区中山东一路2号', 'shanghai', 'published', 2, '2011-05-20', 5,
       '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅", "会议室"]',
       '坐落于外滩核心位置，尽享黄浦江美景，奢华与历史完美融合。',
       '["/uploads/hotels/2.png", "/uploads/hotels/3.png"]'),
      
      (3, '广州白天鹅宾馆', '广州市越秀区沙面南街1号', 'guangzhou', 'published', 3, '2008-10-15', 5,
       '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅"]',
       '广州老牌五星级酒店，坐落于珠江边，享有绝佳江景。',
       '["/uploads/hotels/4.png"]'),
      
      (4, '深圳瑞吉酒店', '深圳市福田区深南大道5016号', 'shenzhen', 'published', 3, '2012-08-15', 5,
       '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅", "会议室"]',
       '深圳顶级奢华酒店，位于CBD核心，服务一流。',
       '["/uploads/hotels/5.png"]')
    `);
    console.log('✓ 酒店数据插入成功（4家）');

    // 插入房型数据（每个酒店2种房型）
    await conn.query(`
      INSERT IGNORE INTO room_types (id, hotelId, roomType, price) VALUES
      -- 北京国际大饭店的房型
      (1, 1, '豪华大床房', 888),
      (2, 1, '行政套房', 1288),
      
      -- 上海外滩华尔道夫酒店的房型
      (3, 2, '豪华江景房', 1280),
      (4, 2, '总统套房', 2888),
      
      -- 广州白天鹅宾馆的房型
      (5, 3, '豪华江景房', 780),
      (6, 3, '行政套房', 1180),
      
      -- 深圳瑞吉酒店的房型
      (7, 4, '豪华房', 1180),
      (8, 4, '总统套房', 2688)
    `);
    console.log('✓ 房型数据插入成功（每个酒店2种房型）');

    console.log('\n✅ 数据库初始化完成！');
    console.log('📊 数据统计：');
    console.log('   - 用户：5 个');
    console.log('   - 酒店：4 家');
    console.log('   - 房型：8 种（每家酒店2种）');
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (conn) conn.release();
    await pool.end();
  }
};

initDB();
