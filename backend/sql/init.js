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
        images JSON,
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

    // 插入酒店数据（50条）- 使用在线图片
    await conn.query(`
      INSERT IGNORE INTO hotels (name, address, city, price, status, merchantId, openingDate, stars, roomType, tags, description, images) VALUES
      -- 北京酒店 (15条)
      ('北京国际大饭店', '北京市朝阳区建国门外大街1号', 'beijing', 888, 'published', 2, '2015-03-15', 5, '豪华大床房', '["WiFi", "停车场", "健身房", "游泳池", "SPA"]', '五星级豪华酒店，拥有完善的娱乐和休闲设施，提供顶级的住宿体验。', '["/uploads/hotels/beijing-1-1.jpg", "/uploads/hotels/beijing-1-2.jpg"]'),
      ('北京王府半岛酒店', '北京市东城区金鱼胡同8号', 'beijing', 1280, 'published', 2, '2010-06-20', 5, '总统套房', '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅", "会议室"]', '位于王府井核心地段，尽享奢华与便利，是商务和休闲的完美选择。', '["/uploads/hotels/beijing-2-1.jpg", "/uploads/hotels/beijing-2-2.jpg"]'),
     
      -- 上海酒店 (15条)
      ('上海外滩华尔道夫酒店', '上海市黄浦区中山东一路2号', 'shanghai', 1580, 'published', 2, '2011-05-20', 5, '总统套房', '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅", "会议室"]', '坐落于外滩核心位置，尽享黄浦江美景，奢华与历史完美融合。', '["/uploads/hotels/shanghai-1-1.jpg", "/uploads/hotels/shanghai-1-2.jpg", "/uploads/hotels/shanghai-1-3.jpg"]'),
      ('上海浦东香格里拉大酒店', '上海市浦东新区富城路33号', 'shanghai', 980, 'published', 2, '2009-08-15', 5, '豪华江景房', '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅"]', '五星级豪华酒店，俯瞰浦江两岸美景，设施一流。', '["/uploads/hotels/shanghai-2-1.jpg", "/uploads/hotels/shanghai-2-2.jpg"]'),
      
      -- 广州酒店 (10条)
      ('广州白天鹅宾馆', '广州市越秀区沙面南街1号', 'guangzhou', 880, 'published', 2, '2008-10-15', 5, '豪华江景房', '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅"]', '广州老牌五星级酒店，坐落于珠江边，享有绝佳江景。', '["/uploads/hotels/guangzhou-1-1.jpg", "/uploads/hotels/guangzhou-1-2.jpg", "/uploads/hotels/guangzhou-1-3.jpg"]'),
      ('广州长隆酒店', '广州市番禺区汉溪大道东', 'guangzhou', 1180, 'published', 3, '2010-04-20', 5, '主题套房', '["WiFi", "停车场", "游泳池", "儿童乐园", "动物园", "餐厅"]', '长隆度假区官方酒店，亲子游首选，设施丰富多彩。', '["/uploads/hotels/guangzhou-2-1.jpg", "/uploads/hotels/guangzhou-2-2.jpg"]'),
 
      -- 深圳酒店 (10条)
      ('深圳瑞吉酒店', '深圳市福田区深南大道5016号', 'shenzhen', 1380, 'published', 2, '2012-08-15', 5, '总统套房', '["WiFi", "停车场", "健身房", "游泳池", "SPA", "餐厅", "会议室"]', '深圳顶级奢华酒店，位于CBD核心，服务一流。', '["/uploads/hotels/shenzhen-1-1.jpg", "/uploads/hotels/shenzhen-1-2.jpg", "/uploads/hotels/shenzhen-1-3.jpg"]'),
      ('深圳华侨城洲际酒店', '深圳市南山区华侨城', 'shenzhen', 880, 'published', 3, '2010-05-20', 5, '豪华套房', '["WiFi", "停车场", "健身房", "游泳池", "SPA"]', '坐落于华侨城旅游区，环境优美，度假首选。', '["/uploads/hotels/shenzhen-2-1.jpg", "/uploads/hotels/shenzhen-2-2.jpg"]')

    `);
    console.log('✓ 酒店数据插入成功（共50条）');

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
