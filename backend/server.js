const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const pool = require('./config/database');
require('dotenv').config();

const userRoutes = require('./routes/users');
const hotelRoutes = require('./routes/hotels');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// 数据库初始化函数
const initDatabase = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // 检查 hotels 表是否存在
    const [tables] = await conn.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'hotels'
    `);
    
    if (tables.length === 0) {
      console.log('🔧 数据库表不存在，开始初始化...');
      
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
      
      // 创建酒店表
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
      
      // 插入初始用户数据
      await conn.query(`
        INSERT IGNORE INTO users (id, username, password, email, phone, role) VALUES
        (1, 'admin1', '123456', NULL, NULL, 'admin'),
        (2, 'merchant1', '123456', NULL, NULL, 'merchant'),
        (3, '陈凯文', 'Kv20060426', '123@qq.com', '18017402610', 'merchant'),
        (4, 'icc', 'Wang2006', NULL, NULL, 'admin'),
        (5, 'user1', '123456', NULL, NULL, 'user')
      `);
      
      // 插入初始酒店数据
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
      
      // 插入房型数据
      await conn.query(`
        INSERT IGNORE INTO room_types (id, hotelId, roomType, price) VALUES
        (1, 1, '豪华大床房', 888),
        (2, 1, '行政套房', 1288),
        (3, 2, '豪华江景房', 1280),
        (4, 2, '总统套房', 2888),
        (5, 3, '豪华江景房', 780),
        (6, 3, '行政套房', 1180),
        (7, 4, '豪华房', 1180),
        (8, 4, '总统套房', 2688)
      `);
      
      console.log('✅ 数据库初始化完成！');
    } else {
      console.log('✅ 数据库已存在，跳过初始化');
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
  } finally {
    if (conn) conn.release();
  }
};

// 中间件
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://hotel-book-system-production.up.railway.app',
    /\.vercel\.app$/  // 允许所有 vercel.app 域名
  ],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务 - 提供上传的图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/analytics', analyticsRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // 启动时初始化数据库
  await initDatabase();
});
