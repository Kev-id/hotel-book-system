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
        email VARCHAR(100) UNIQUE ,
        phone VARCHAR(20) UNIQUE ,
        role ENUM('admin', 'merchant', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ users 表创建成功');

    // 创建酒店表
    await conn.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(200) NOT NULL,
        city VARCHAR(50),
        price INT,
        status ENUM('pending', 'published', 'rejected') DEFAULT 'pending',
        rejectReason VARCHAR(500),
        merchantId INT,
        openingDate DATE,
        stars INT,
        roomType VARCHAR(50),
        tags JSON,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchantId) REFERENCES users(id)
      )
    `);
    console.log('✓ hotels 表创建成功');

    // 插入初始数据
    await conn.query(`
      INSERT IGNORE INTO users (id, username, password, email, phone, role) VALUES
      (1, 'admin1', '123456', NULL, NULL, 'admin'),
      (2, 'merchant1', '123456', NULL, NULL, 'merchant'),
      (3, '陈凯文', 'Kv20060426', '123@qq.com', '18017402610', 'merchant'),
      (4, 'icc', 'Wang2006', NULL, NULL, 'admin'),
      (5, 'user1', '123456', NULL, NULL, 'user')
    `);
    console.log('✓ 用户数据插入成功');

    await conn.query(`
      INSERT IGNORE INTO hotels (name, address, city, price, status, merchantId, openingDate, stars, roomType, tags, description) VALUES
      ('测试酒店1', '北京市朝阳区', 'beijing', 299, 'published', 2, '2020-01-15', 5, '豪华大床房', '["WiFi", "停车场", "健身房"]', '位于北京市朝阳区的豪华五星酒店，提供顶级的住宿体验和完善的设施服务。'),
      ('测试酒店2', '上海市浦东新区', 'shanghai', 399, 'published', 2, '2019-06-20', 4, '标准间', '["WiFi", "餐厅", "会议室"]', '上海浦东新区商务酒店，交通便利，适合商务出差。'),
      ('上海大酒店', '上海市静安区', 'shanghai', 9999, 'published', 3, '2018-03-10', 5, '总统套房', '["WiFi", "停车场", "健身房", "游泳池", "SPA"]', '五星级豪华酒店，拥有总统套房和顶级服务，是商务和休闲的完美选择。'),
      ('广州小酒店', '某个区', 'guangzhou', 133, 'published', 3, '2021-08-05', 3, '经济间', '["WiFi", "前台24小时"]', '经济实惠的酒店，提供基础但舒适的住宿环境。'),
      ('广州大酒店', '另一个区', 'guangzhou', 999, 'published', 3, '2020-12-01', 4, '商务间', '["WiFi", "停车场", "餐厅", "会议室"]', '广州商务酒店，设施完善，服务周到，是商务旅客的首选。'),
      ('老北京大酒店', '大栅栏', 'beijing', 999, 'published', 3, '2017-05-15', 5, '古典风格房', '["WiFi", "停车场", "健身房", "中餐厅", "茶楼"]', '融合北京古典文化的五星级酒店，提供独特的文化体验和传统服务。')
    `);
    console.log('✓ 酒店数据插入成功');

    console.log('\n✅ 数据库初始化完成！');
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
