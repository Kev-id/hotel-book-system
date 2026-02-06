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
        role ENUM('admin', 'merchant') DEFAULT 'merchant',
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
        merchantId INT,
        openingDate DATE,
        stars INT,
        roomType VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchantId) REFERENCES users(id)
      )
    `);
    console.log('✓ hotels 表创建成功');

    // 插入初始数据
    await conn.query(`
      INSERT IGNORE INTO users (username, password, role) VALUES
      ('admin1', '123456', 'admin'),
      ('merchant1', '123456', 'merchant'),
      ('陈凯文', 'Kv20060426', 'merchant')
    `);
    console.log('✓ 用户数据插入成功');

    await conn.query(`
      INSERT IGNORE INTO hotels (name, address, city, price, status, merchantId, openingDate, stars, roomType) VALUES
      ('测试酒店1', '北京市朝阳区', 'beijing', 299, 'published', 2, '2020-01-15', 5, '豪华大床房'),
      ('测试酒店2', '上海市浦东新区', 'shanghai', 399, 'published', 2, '2019-06-20', 4, '标准间'),
      ('上海大酒店', '上海市静安区', 'shanghai', 9999, 'published', 3, '2018-03-10', 5, '总统套房'),
      ('广州小酒店', '某个区', 'guangzhou', 133, 'published', 3, '2021-08-05', 3, '经济间'),
      ('广州大酒店', '另一个区', 'guangzhou', 999, 'published', 3, '2020-12-01', 4, '商务间'),
      ('老北京大酒店', '大栅栏', 'beijing', 999, 'published', 3, '2017-05-15', 5, '古典风格房')
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
