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
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// 数据库连接检查
const checkDatabase = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    
    // 检查是否已初始化
    const [tables] = await conn.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'hotels'
    `);
    
    if (tables.length === 0) {
      console.log('⚠️  数据库未初始化，请运行: node backend/sql/init.js');
    }
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('请检查 .env 配置和 MySQL 服务是否启动');
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
app.use('/api/ai', aiRoutes);

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
  // 启动时检查数据库连接
  await checkDatabase();
});
